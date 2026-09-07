interface SwitchToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel?: string;
}

/** Switch genérico reutilizable (thumb blanco sobre track redondeado). */
export function SwitchToggle({ checked, onChange, ariaLabel }: SwitchToggleProps) {
  return (
    <label className="relative inline-block h-[2em] w-[3.5em] cursor-pointer select-none align-middle">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={ariaLabel}
      />
      <span
        className={
          "absolute inset-0 rounded-full bg-[#cccccc] transition-all duration-300 ease-in-out peer-checked:bg-[#4296f4] " +
          "after:absolute after:left-[0.25em] after:top-[0.25em] after:inline-block after:size-[1.5em] after:rounded-full " +
          "after:bg-white after:shadow-[10px_0_40px_rgba(0,0,0,0.1)] after:transition-all after:duration-300 after:ease-in-out " +
          "after:content-[''] peer-checked:after:translate-x-[1.5em]"
        }
      />
    </label>
  );
}
