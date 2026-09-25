import { GoogleGenAI, ThinkingLevel } from '@google/genai';

/**
 * Soporte con IA de DMAIX (widget flotante). Corre en el servidor para que la
 * API key nunca llegue al navegador. Usa `GEMINI_API_KEY` (la misma de los
 * informes BI); sin ella responde 503 y el widget muestra el contacto directo.
 *
 * Límites anti-abuso (el endpoint es público): mensaje ≤ 600 caracteres,
 * solo los últimos 8 turnos de historial y respuestas cortas.
 */

// El plan gratuito de Gemini es intermitente (503/429 esporádicos): se reintenta rotando
// modelos hasta el deadline, bajo el límite de ~10 s de las funciones de Netlify.
const GEMINI_MODELS = process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : ['gemini-flash-lite-latest', 'gemini-flash-latest'];
const GEMINI_RETRYABLE = new Set([404, 429, 500, 503]);
const DEADLINE_MS = 8_000;
const MAX_MESSAGE_CHARS = 600;
const MAX_HISTORY_TURNS = 8;
const MAX_TURN_CHARS = 1_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Conocimiento del asistente: solo funciones que DMAIX realmente tiene. */
const SYSTEM_PROMPT = {
  es: `Eres el asistente oficial de soporte de DMAIX, una plataforma web de trazabilidad industrial para Metalúrgica Huechuraba (Chile), basada en Lean Six Sigma y la metodología DMAIC. Resuelves dudas sobre cómo usar la plataforma, en español, de forma concisa, clara y amable.

Qué hace DMAIX, por rol:
- Vendedor: registra Solicitudes de Venta (cliente, RUT, proyecto, monto en UF y prioridad) y ve su estado: pendiente, aprobada (con la OT generada) o rechazada (con el motivo).
- Administración: revisa las Solicitudes Pendientes, ajusta monto, estación inicial, prioridad, fecha compromiso y responsable, y las aprueba para crear la Orden de Trabajo (OT), o las rechaza con motivo. Usa la Torre de Control (salud de planta, OTD, tiempo de ciclo, OTs detenidas, carga por estación, informes de paradas exportables a Excel/CSV), la Analítica BI (estudio de tiempos, horas ociosas, OEE e informe con IA con propuestas de reasignación de personal) y la gestión de trabajadores.
- Operador de taller: usa el Checklist Rápido para avanzar las OTs de estación con un toque, detener una OT registrando el motivo (causa raíz) y reanudarla con la acción correctiva.
- Cliente B2B: sigue el avance de sus pedidos por etapas y sus despachos, y descarga la Ficha de Conformidad en PDF.
- Todos los roles internos tienen el Canal Taller, un chat interno de la planta.
- Accesibilidad: modo Alto Contraste para trabajar con luz solar directa o poca luz, y cambio de idioma español/inglés.
- La Guía de Uso (botón "?" en la barra superior) recorre la plataforma paso a paso.
- Para probar, en Iniciar Sesión hay cuentas demo de cada rol ("Usar cuenta demo"). La demo en planta se solicita en el formulario "Solicita una demo en planta" de la página de inicio.

Reglas:
- Responde en máximo 3 oraciones cortas o viñetas simples, sin markdown pesado.
- Habla solo de DMAIX y su uso. Si te preguntan otra cosa, redirige amablemente al uso de la plataforma.
- No inventes funciones, precios, integraciones ni datos de la empresa. Si no lo sabes, dilo y sugiere el soporte directo (lunes a viernes, 8:30 a 17:00) o solicitar una demo.
- Nunca pidas ni aceptes contraseñas ni datos sensibles.`,
  en: `You are the official support assistant for DMAIX, an industrial traceability web platform for Metalúrgica Huechuraba (Chile), built on Lean Six Sigma and the DMAIC methodology. You answer questions about how to use the platform, in English, concisely, clearly and kindly.

What DMAIX does, by role:
- Sales rep: logs Sales Requests (client, tax ID, project, amount in UF and priority) and tracks their status: pending, approved (with the generated work order) or rejected (with the reason).
- Administration: reviews Pending Requests, adjusts amount, starting station, priority, due date and lead, then approves them to create the Work Order, or rejects them with a reason. Uses the Control Tower (plant health, OTD, cycle time, stopped work orders, station load, stoppage reports exportable to Excel/CSV), BI Analytics (time study, idle hours, OEE and an AI report with staff reassignment proposals) and worker management.
- Shop operator: uses the Quick Checklist to move work orders between stations with one tap, stop a work order logging the reason (root cause) and resume it with the corrective action.
- B2B client: follows order progress by stage and dispatches, and downloads the Conformity PDF.
- All internal roles have the Shop Channel, an internal plant chat.
- Accessibility: High Contrast mode for direct sunlight or low light, and Spanish/English language switch.
- The User Guide ("?" button in the top bar) walks through the platform step by step.
- To try it, the Log In screen has demo accounts for every role ("Use a demo account"). An on-site demo is requested through the "Request an on-site demo" form on the home page.

Rules:
- Answer in at most 3 short sentences or simple bullets, no heavy markdown.
- Only talk about DMAIX and how to use it. For anything else, kindly steer back to the platform.
- Don't invent features, prices, integrations or company data. If you don't know, say so and suggest direct support (Monday to Friday, 8:30 AM to 5:00 PM) or requesting a demo.
- Never ask for or accept passwords or sensitive data.`,
} as const;

type Language = keyof typeof SYSTEM_PROMPT;
type Turn = { role: 'user' | 'assistant'; text: string };

class AiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

/** Historial saneado: solo roles válidos, textos no vacíos y recortados, últimos N turnos. */
function sanitizeHistory(raw: unknown): Turn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((t): t is Turn => typeof t === 'object' && t !== null && (t.role === 'user' || t.role === 'assistant') && typeof t.text === 'string' && t.text.trim() !== '')
    .slice(-MAX_HISTORY_TURNS)
    .map((t) => ({ role: t.role, text: t.text.slice(0, MAX_TURN_CHARS) }));
}

async function replyWithGemini(apiKey: string, language: Language, history: Turn[], message: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  // Gemini exige que el historial empiece por un turno del usuario: se descarta el saludo inicial del asistente.
  const firstUser = history.findIndex((t) => t.role === 'user');
  const contents = [
    ...(firstUser === -1 ? [] : history.slice(firstUser)).map((t) => ({ role: t.role === 'user' ? 'user' : 'model', parts: [{ text: t.text }] })),
    { role: 'user', parts: [{ text: message }] },
  ];

  const deadline = Date.now() + DEADLINE_MS;
  let lastError: unknown;
  for (let attempt = 0; Date.now() < deadline; attempt++) {
    const model = GEMINI_MODELS[attempt % GEMINI_MODELS.length];
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: SYSTEM_PROMPT[language],
          maxOutputTokens: 400,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        },
      });
      const text = response.text?.trim();
      if (!text) throw new AiError(502, 'Respuesta sin contenido');
      return text;
    } catch (error) {
      lastError = error;
      if (error instanceof AiError) break;
      const status = (error as { status?: number }).status;
      if (!status || !GEMINI_RETRYABLE.has(status)) break;
      await sleep(Math.min(500 * (attempt + 1), Math.max(deadline - Date.now(), 0)));
    }
  }
  if (lastError instanceof AiError) throw lastError;
  const status = (lastError as { status?: number }).status;
  if (status === 429) throw new AiError(429, 'Límite de Gemini alcanzado, reintenta más tarde');
  if (status === 400 || status === 401 || status === 403) throw new AiError(502, `Gemini rechazó la solicitud (${status}): revisa la API key`);
  throw new AiError(502, `Error de Gemini${status ? ` (${status})` : ''}`);
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return json({ error: 'No hay API key de IA configurada (GEMINI_API_KEY)' }, 503);

  let payload: { message?: unknown; history?: unknown; language?: unknown };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'JSON inválido' }, 400);
  }
  const message = typeof payload.message === 'string' ? payload.message.trim() : '';
  if (!message) return json({ error: 'Falta `message`' }, 400);
  if (message.length > MAX_MESSAGE_CHARS) return json({ error: `El mensaje supera ${MAX_MESSAGE_CHARS} caracteres` }, 413);
  const language: Language = payload.language === 'en' ? 'en' : 'es';

  try {
    const reply = await replyWithGemini(apiKey, language, sanitizeHistory(payload.history), message);
    return json({ reply });
  } catch (error) {
    if (error instanceof AiError) return json({ error: error.message }, error.status);
    return json({ error: 'No se pudo generar la respuesta' }, 500);
  }
};
