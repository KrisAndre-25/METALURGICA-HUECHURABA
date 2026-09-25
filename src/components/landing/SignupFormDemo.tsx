import { IconCircleCheck } from '@tabler/icons-react';
import { useState, type FormEvent } from 'react';
import { useToast } from '../ui/Toast';
import { useLandingLanguage, type LandingLanguage } from '../../contexts/LandingLanguageContext';
import './demoForm.css';
import { SECTION_TITLE_CLASSES } from './sectionTitle';

const TEXT: Record<
  LandingLanguage,
  {
    title: string;
    subtitle: string;
    submitted: string;
    name: string;
    phone: string;
    email: string;
    message: string;
    submit: string;
    reset: string;
    toastSuccess: string;
  }
> = {
  es: {
    title: 'Solicita una demo en planta',
    subtitle: 'Te mostramos DMAIX operando con datos reales de una planta metalúrgica, sin costo ni compromiso.',
    submitted: 'Solicitud enviada correctamente. Revisa tu correo en los próximos minutos.',
    name: 'Nombre y apellido',
    phone: 'Teléfono',
    email: 'Correo corporativo',
    message: 'Cuéntanos de tu planta: qué fabrican, cuántas estaciones tienen y qué te gustaría controlar.',
    submit: 'Solicitar Demo',
    reset: 'Limpiar',
    toastSuccess: '¡Gracias! Un especialista de DMAIX te contactará a la brevedad.',
  },
  en: {
    title: 'Request an on-site demo',
    subtitle: "We'll show you DMAIX running with real data from a metalworking plant, no cost, no commitment.",
    submitted: 'Request sent successfully. Check your inbox in the next few minutes.',
    name: 'Full name',
    phone: 'Phone number',
    email: 'Corporate email',
    message: 'Tell us about your plant: what you build, how many stations you run and what you want to control.',
    submit: 'Request Demo',
    reset: 'Clear',
    toastSuccess: 'Thanks! A DMAIX specialist will reach out shortly.',
  },
};

const EMPTY_FORM = { name: '', phone: '', email: '', message: '' };

/**
 * Formulario de solicitud de demo con el diseño de Uiverse (esquina cortada y
 * borde de acento) en la paleta DMAIX. Sin backend real: el envío muestra un
 * toast informativo en vez de simular un envío.
 */
export function SignupFormDemo() {
  const { language } = useLandingLanguage();
  const t = TEXT[language];
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) return;
    setSubmitted(true);
    showToast(t.toastSuccess);
  };

  return (
    <div id="subscribe" className="w-full px-4">
      <form onSubmit={handleSubmit} onReset={() => setForm(EMPTY_FORM)} className="demo-form">
        <h2 className={`df-heading ${SECTION_TITLE_CLASSES}`}>{t.title}</h2>
        <p className="df-subtitle">{t.subtitle}</p>

        {submitted ? (
          <div className="flex items-start gap-2.5 border-l-4 border-emerald-500 bg-emerald-500/10 p-4 text-sm text-emerald-400">
            <IconCircleCheck className="mt-0.5 size-5 shrink-0" />
            {t.submitted}
          </div>
        ) : (
          <>
            <div className="df-row">
              <input className="df-input" type="text" name="name" autoComplete="name" placeholder={t.name} aria-label={t.name} value={form.name} onChange={set('name')} required />
              <input className="df-input" type="tel" name="phone" autoComplete="tel" placeholder={t.phone} aria-label={t.phone} value={form.phone} onChange={set('phone')} required />
            </div>
            <input className="df-input" type="email" name="email" autoComplete="email" placeholder={t.email} aria-label={t.email} value={form.email} onChange={set('email')} required />
            <textarea className="df-textarea" name="message" rows={4} placeholder={t.message} aria-label={t.message} value={form.message} onChange={set('message')} />
            <div className="df-buttons">
              <button type="submit" className="df-send">{t.submit}</button>
              <div className="df-reset-wrap">
                <button type="reset" className="df-reset">{t.reset}</button>
              </div>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
