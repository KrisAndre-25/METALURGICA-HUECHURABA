import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUiPrefs } from '../contexts/UiPrefsContext';
import './aiSupportWidget.css';

type Turn = { role: 'user' | 'assistant'; text: string };

/** Función en el servidor (netlify/functions/ai-support.ts): la API key de Gemini nunca llega al navegador. */
const AI_SUPPORT_ENDPOINT = '/.netlify/functions/ai-support';
const MAX_MESSAGE_CHARS = 600;

/**
 * Widget flotante de Soporte IA, montado una vez para toda la plataforma
 * (landing, login y dashboard). Conversa con Gemini vía la Netlify Function;
 * si la IA no responde, deriva al soporte directo.
 */
export function AISupportWidget() {
  const { isAuthenticated } = useAuth();
  const { t, language } = useUiPrefs();
  const tr = t.support;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Turn[]>(() => [{ role: 'assistant', text: tr.greeting }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const userMsg = input.trim();
    if (!userMsg || loading) return;

    const history = messages;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await fetch(AI_SUPPORT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history, language }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as { reply?: string };
      if (!data.reply) throw new Error('Respuesta vacía');
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply as string }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: tr.error }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`ai-support ${isAuthenticated ? 'is-app' : 'is-landing'}`}>
      {isOpen && (
        <div className="chat-window" role="dialog" aria-label={tr.title}>
          <div className="chat-header">
            <div className="chat-title">
              <span className="online-dot" aria-hidden />
              <span>{tr.title}</span>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} className="close-btn" aria-label={tr.close}>
              ✕
            </button>
          </div>

          <div className="chat-messages" aria-live="polite">
            {messages.map((msg, index) => (
              <div key={index} className={`message-bubble ${msg.role}`}>
                {msg.text}
              </div>
            ))}
            {loading && <div className="message-bubble assistant loading">{tr.thinking}</div>}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSend} className="chat-input-form">
            <input
              ref={inputRef}
              type="text"
              placeholder={tr.placeholder}
              aria-label={tr.placeholder}
              value={input}
              maxLength={MAX_MESSAGE_CHARS}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              {tr.send}
            </button>
          </form>

          <div className="contact-quick-links">
            <span>📞 {tr.directSupport}</span>
            <span>🕒 {tr.hours}</span>
          </div>
        </div>
      )}

      <button
        type="button"
        className="support-trigger-btn"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-label={tr.trigger}
        title={tr.trigger}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" height={18} width={18} aria-hidden>
          <path
            strokeLinejoin="round"
            strokeLinecap="round"
            stroke="#ffffff"
            d="M1 10V8C1 2.5 6 1 8 1C10 1 15 2.5 15 8V10M1 10C1 10.5552 1 11.1543 1.0984 11.6204C1.24447 12.3122 2 13 3 13C4 13 4.75553 12.3122 4.9016 11.6204C5 11.1543 5 10.5552 5 10C5 9.44485 5 8.84565 4.9016 8.37961C4.75553 7.68776 4 7 3 7C2 7 1.24447 7.68776 1.0984 8.37961C1 8.84565 1 9.44485 1 10ZM15 10C15 10.5552 15 11.1543 14.9016 11.6204C14.7555 12.3122 14 13 13 13C12 13 11.2445 12.3122 11.0984 11.6204C11 11.1543 11 10.5552 11 10C11 9.44485 11 8.84565 11.0984 8.37961C11.2445 7.68776 12 7 13 7C14 7 14.7555 7.68776 14.9016 8.37961C15 8.84565 15 9.44485 15 10ZM15 10C15 15.5 12.5 15 8 15"
          />
        </svg>
        <span className="support-trigger-label">{tr.trigger}</span>
      </button>
    </div>
  );
}
