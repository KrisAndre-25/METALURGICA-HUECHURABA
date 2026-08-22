import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from './cn';

const FIELD_CLASSES = 'w-full rounded-xl border border-forge-border bg-forge-bg px-4 text-base outline-none transition-colors focus:border-forge-accent';

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

type TouchInputProps = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string };

/** Input táctil: altura 52px (h-13) para minimizar toques errados en pantallas pequeñas. */
export function TouchInput({ label, hint, error, className, ...props }: TouchInputProps) {
  return (
    <FieldWrap label={label} hint={hint} error={error}>
      <input className={cn(FIELD_CLASSES, 'h-13', error && 'border-forge-stopped', className)} {...props} />
    </FieldWrap>
  );
}

type TouchTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string; error?: string };

export function TouchTextarea({ label, hint, error, className, ...props }: TouchTextareaProps) {
  return (
    <FieldWrap label={label} hint={hint} error={error}>
      <textarea className={cn(FIELD_CLASSES, 'min-h-24 resize-none py-3', error && 'border-forge-stopped', className)} {...props} />
    </FieldWrap>
  );
}

type TouchSelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: string; error?: string };

export function TouchSelect({ label, hint, error, className, children, ...props }: TouchSelectProps) {
  return (
    <FieldWrap label={label} hint={hint} error={error}>
      <select className={cn(FIELD_CLASSES, 'h-13', error && 'border-forge-stopped', className)} {...props}>
        {children}
      </select>
    </FieldWrap>
  );
}
