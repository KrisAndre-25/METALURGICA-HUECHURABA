import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from './cn';

const FIELD_CLASSES = 'w-full rounded-xl border border-forge-border bg-forge-bg px-4 text-base text-slate-100 outline-none transition-colors placeholder:text-forge-steel/60 focus:border-forge-accent';

interface FieldWrapProps {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

function FieldWrap({ label, hint, error, children }: FieldWrapProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-forge-steel">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-forge-stopped">{error}</span> : hint ? <span className="mt-1 block text-xs text-forge-steel">{hint}</span> : null}
    </label>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string; icon?: ReactNode };

/** Input del design system: altura 52px (h-13) para minimizar toques errados en pantallas táctiles. */
export function Input({ label, hint, error, icon, className, ...props }: InputProps) {
  return (
    <FieldWrap label={label} hint={hint} error={error}>
      <div className="relative">
        {icon && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-forge-steel">{icon}</span>}
        <input className={cn(FIELD_CLASSES, 'h-13', icon && 'pl-11', error && 'border-forge-stopped', className)} {...props} />
      </div>
    </FieldWrap>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string; error?: string };

export function Textarea({ label, hint, error, className, ...props }: TextareaProps) {
  return (
    <FieldWrap label={label} hint={hint} error={error}>
      <textarea className={cn(FIELD_CLASSES, 'min-h-24 resize-none py-3', error && 'border-forge-stopped', className)} {...props} />
    </FieldWrap>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: string; error?: string };

export function Select({ label, hint, error, className, children, ...props }: SelectProps) {
  return (
    <FieldWrap label={label} hint={hint} error={error}>
      <select className={cn(FIELD_CLASSES, 'h-13', error && 'border-forge-stopped', className)} {...props}>
        {children}
      </select>
    </FieldWrap>
  );
}
