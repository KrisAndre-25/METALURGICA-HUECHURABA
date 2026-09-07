import { IconBuildingFactory2, IconMail, IconUser } from '@tabler/icons-react';
import { useState, type FormEvent } from 'react';
import { useToast } from '../ui/Toast';
import { cn } from '../ui/cn';
import { useLandingLanguage, type LandingLanguage } from '../../contexts/LandingLanguageContext';

const FIELD_CLASSES =
  'h-12 w-full rounded-xl border border-blue-900/30 bg-black/60 px-4 text-sm text-slate-100 outline-none ' +
  'placeholder:text-slate-500 transition-colors focus:border-blue-500';

const TEXT: Record<
  LandingLanguage,
  {
    title: string;
    subtitle: string;
    submitted: string;
    firstName: string;
    lastName: string;
    email: string;
    plant: string;
    submit: string;
    toastSuccess: string;
  }
> = {
  es: {
    title: 'Solicita una demo en planta',
    subtitle: 'Te mostramos DMAIX operando con datos reales de una planta metalúrgica — sin costo ni compromiso.',
    submitted: 'Solicitud enviada correctamente. Revisa tu correo en los próximos minutos.',
    firstName: 'Nombre',
    lastName: 'Apellido',
    email: 'Correo corporativo',
    plant: 'Nombre de la planta',
    submit: 'Solicitar Demo',
    toastSuccess: '¡Gracias! Un especialista de DMAIX te contactará a la brevedad.',
  },
  en: {
    title: 'Request an on-site demo',
    subtitle: "We'll show you DMAIX running with real data from a metalworking plant — no cost, no commitment.",
    submitted: 'Request sent successfully. Check your inbox in the next few minutes.',
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Corporate email',
    plant: 'Plant name',
    submit: 'Request Demo',
    toastSuccess: "Thanks! A DMAIX specialist will reach out shortly.",
  },
};

function Field({
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
}: {
  icon: typeof IconUser;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(FIELD_CLASSES, 'pl-11')}
      />
    </div>
  );
}

/**
 * Formulario de solicitud de demo — estilo Aceternity `SignupForm` adaptado
 * a leads B2B de plantas metalúrgicas. Sin backend real: el submit muestra
 * un toast informativo en vez de simular una cuenta creada.
 */
export function SignupFormDemo() {
  const { language } = useLandingLanguage();
  const t = TEXT[language];
  const { showToast } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [plant, setPlant] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return;
    setSubmitted(true);
    showToast(t.toastSuccess);
  };

  return (
    <div
      id="subscribe"
      className="mx-auto w-full max-w-md rounded-3xl border border-blue-500/20 bg-slate-900/80 p-6 shadow-[0_0_40px_rgba(59,130,246,0.08)] backdrop-blur-sm sm:p-8"
    >
      <h3 className="text-xl font-bold text-white">{t.title}</h3>
      <p className="mt-1.5 text-sm text-slate-400">{t.subtitle}</p>

      {submitted ? (
        <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">{t.submitted}</div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field icon={IconUser} value={firstName} onChange={setFirstName} placeholder={t.firstName} required />
            <Field icon={IconUser} value={lastName} onChange={setLastName} placeholder={t.lastName} required />
          </div>
          <Field icon={IconMail} value={email} onChange={setEmail} placeholder={t.email} type="email" required />
          <Field icon={IconBuildingFactory2} value={plant} onChange={setPlant} placeholder={t.plant} />

          <button
            type="submit"
            className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-bold text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all hover:from-blue-500 hover:to-cyan-400 hover:shadow-[0_0_28px_rgba(59,130,246,0.55)]"
          >
            {t.submit}
          </button>
        </form>
      )}
    </div>
  );
}
