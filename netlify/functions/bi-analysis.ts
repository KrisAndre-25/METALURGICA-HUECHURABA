import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

/**
 * Conector de IA del módulo BI: recibe el snapshot consolidado del estudio de
 * tiempos (capacidad vs. horas reales, paradas, horas ociosas) y devuelve el
 * informe estructurado en 4 secciones. Corre del lado del servidor para que la
 * API key nunca llegue al navegador.
 *
 * Proveedor según la variable de entorno configurada (Netlify o `.env.local`):
 *   GEMINI_API_KEY    → Google Gemini (tiene plan gratuito)
 *   ANTHROPIC_API_KEY → Claude (de pago)
 * Sin ninguna, responde 503 y el cliente usa el motor de reglas local.
 */

// El plan gratuito de Gemini es intermitente: a ratos responde 503 ("alta demanda")
// o incluso 403 en llamadas que segundos después funcionan. Se reintenta rotando
// entre modelos, con pausas cortas, hasta GEMINI_DEADLINE_MS (bajo el límite de
// ~10 s de las funciones síncronas de Netlify). `GEMINI_MODEL` fuerza uno solo.
const GEMINI_MODELS = process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : ['gemini-flash-lite-latest', 'gemini-flash-latest'];
const GEMINI_RETRYABLE = new Set([403, 404, 429, 500, 503]);
const GEMINI_DEADLINE_MS = 8_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const CLAUDE_MODEL = process.env.BI_AI_MODEL ?? 'claude-opus-5';

const REPORT_SCHEMA = {
  type: 'object',
  properties: {
    executiveSummary: { type: 'string' },
    bottlenecksAndIdle: { type: 'array', items: { type: 'string' } },
    staffReorganization: { type: 'array', items: { type: 'string' } },
    rootCauseAnalysis: { type: 'array', items: { type: 'string' } },
  },
  required: ['executiveSummary', 'bottlenecksAndIdle', 'staffReorganization', 'rootCauseAnalysis'],
  additionalProperties: false,
};

const SYSTEM_PROMPT = {
  es: `Eres un ingeniero industrial senior que analiza el estudio de tiempos de una planta metalúrgica (Metalúrgica Huechuraba, Chile) para su gerencia.

Recibirás un JSON con las métricas de un período: por estación, horas disponibles (capacidad de turno), horas trabajadas en OTs, horas en parada, horas ociosas, utilización (%), dotación de operadores y cantidad de paradas; además el OEE (disponibilidad × rendimiento × calidad) y las horas perdidas por causa de parada. La calidad se asume 100% porque aún no se registran reprocesos.

Redacta un informe en español con cuatro secciones:
1. executiveSummary: un párrafo con el estado global de la planta en el período.
2. bottlenecksAndIdle: cuellos de botella y estaciones ociosas, una viñeta por hallazgo, citando cifras concretas (ej. "Corte operó al 62,5% de su capacidad; cuenta con 15 h ociosas").
3. staffReorganization: propuestas concretas de reasignación de personal entre estaciones o hacia capacitación/mantención, indicando cuántos operadores, desde dónde, hacia dónde y en qué turno o franja. Nunca propongas dejar una estación con 0 operadores.
4. rootCauseAnalysis: análisis de causa raíz de las paradas recurrentes y una acción correctiva para cada una.

Básate solo en los datos entregados; si un dato no alcanza para concluir algo, dilo. Cada viñeta: una o dos oraciones, sin markdown.`,
  en: `You are a senior industrial engineer analyzing the time study of a metalworking plant (Metalúrgica Huechuraba, Chile) for its management.

You will receive a JSON with a period's metrics: per station, available hours (shift capacity), hours worked on work orders, stopped hours, idle hours, utilization (%), operator headcount and number of stops; plus OEE (availability × performance × quality) and hours lost per stop cause. Quality is assumed at 100% because rework is not tracked yet.

Write a report in English with four sections:
1. executiveSummary: one paragraph on the plant's overall state in the period.
2. bottlenecksAndIdle: bottlenecks and idle stations, one bullet per finding, citing concrete figures (e.g. "Cutting ran at 62.5% of capacity; it has 15 idle hours").
3. staffReorganization: concrete staff reassignment proposals between stations or toward training/maintenance, stating how many operators, from where, to where, and in which shift or time slot. Never propose leaving a station with 0 operators.
4. rootCauseAnalysis: root-cause analysis of recurring stops and one corrective action for each.

Rely only on the data provided; if the data is insufficient to conclude something, say so. Each bullet: one or two sentences, no markdown.`,
} as const;

type Language = keyof typeof SYSTEM_PROMPT;

/** Error con status HTTP y mensaje legible para devolver al cliente. */
class AiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

async function analyzeWithGemini(apiKey: string, language: Language, metrics: unknown): Promise<unknown> {
  const ai = new GoogleGenAI({ apiKey });
  const deadline = Date.now() + GEMINI_DEADLINE_MS;
  let lastError: unknown;
  for (let attempt = 0; Date.now() < deadline; attempt++) {
    const model = GEMINI_MODELS[attempt % GEMINI_MODELS.length];
    try {
      return await generateWithGemini(ai, model, language, metrics);
    } catch (error) {
      lastError = error;
      const status = (error as { status?: number }).status;
      if (!status || !GEMINI_RETRYABLE.has(status)) break;
      await sleep(Math.min(500 * (attempt + 1), Math.max(deadline - Date.now(), 0)));
    }
  }
  const error = lastError;
  if (error instanceof AiError) throw error;
  const status = (error as { status?: number }).status;
  if (status === 429) throw new AiError(429, 'Límite gratuito de Gemini alcanzado, reintenta más tarde');
  if (status === 503) throw new AiError(503, 'Gemini está saturado, reintenta en unos minutos');
  if (status === 400 || status === 401 || status === 403) throw new AiError(502, `Gemini rechazó la solicitud (${status}): revisa la API key`);
  throw new AiError(502, `Error de Gemini${status ? ` (${status})` : ''}`);
}

async function generateWithGemini(ai: GoogleGenAI, model: string, language: Language, metrics: unknown): Promise<unknown> {
  const response = await ai.models.generateContent({
    model,
    contents: JSON.stringify(metrics),
    config: {
      systemInstruction: SYSTEM_PROMPT[language],
      responseMimeType: 'application/json',
      responseJsonSchema: REPORT_SCHEMA,
      // Razonamiento mínimo: es un resumen acotado de ~7 filas de datos, y el
      // razonamiento extendido multiplica la latencia sin mejorar el informe.
      thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
    },
  });
  if (!response.text) throw new AiError(502, 'Respuesta sin contenido');
  return JSON.parse(response.text);
}

async function analyzeWithClaude(language: Language, metrics: unknown): Promise<unknown> {
  const client = new Anthropic();
  try {
    const response = await client.beta.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 8000,
      // Si el modelo declina por una política de seguridad, la API reintenta con
      // el modelo de respaldo que corresponda dentro de la misma llamada.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      // Esfuerzo bajo: es un análisis acotado sobre ~7 filas de datos, y las
      // funciones síncronas de Netlify tienen un límite de tiempo corto.
      output_config: { effort: 'low', format: { type: 'json_schema', schema: REPORT_SCHEMA } },
      system: SYSTEM_PROMPT[language],
      messages: [{ role: 'user', content: JSON.stringify(metrics) }],
    });

    if (response.stop_reason === 'refusal') throw new AiError(502, 'El modelo declinó generar el informe');
    if (response.stop_reason === 'max_tokens') throw new AiError(502, 'Respuesta truncada');

    const text = response.content.find((b) => b.type === 'text');
    if (!text || text.type !== 'text') throw new AiError(502, 'Respuesta sin contenido');
    return JSON.parse(text.text);
  } catch (error) {
    if (error instanceof AiError) throw error;
    if (error instanceof Anthropic.RateLimitError) throw new AiError(429, 'Límite de uso alcanzado, reintenta más tarde');
    if (error instanceof Anthropic.APIError) throw new AiError(502, `Error de la API (${error.status})`);
    throw new AiError(500, 'No se pudo generar el informe');
  }
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const geminiKey = process.env.GEMINI_API_KEY;
  const hasClaude = Boolean(process.env.ANTHROPIC_API_KEY);
  if (!geminiKey && !hasClaude) return json({ error: 'No hay API key de IA configurada (GEMINI_API_KEY o ANTHROPIC_API_KEY)' }, 503);

  let payload: { language?: string; metrics?: unknown };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'JSON inválido' }, 400);
  }
  if (!payload.metrics || typeof payload.metrics !== 'object') return json({ error: 'Falta `metrics`' }, 400);
  const language: Language = payload.language === 'en' ? 'en' : 'es';

  try {
    const analysis = geminiKey
      ? await analyzeWithGemini(geminiKey, language, payload.metrics)
      : await analyzeWithClaude(language, payload.metrics);
    return json({ ...(analysis as object), provider: geminiKey ? 'gemini' : 'claude' });
  } catch (error) {
    if (error instanceof AiError) return json({ error: error.message }, error.status);
    return json({ error: 'No se pudo generar el informe' }, 500);
  }
};
