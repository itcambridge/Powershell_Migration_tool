interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  mono?: boolean;
  placeholder?: string;
}

export function TextField({
  id,
  label,
  value,
  onChange,
  mono = false,
  placeholder,
}: TextFieldProps) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none ring-accent/25 placeholder:text-muted/60 focus-visible:border-accent focus-visible:ring-2 ${
          mono ? "font-mono" : ""
        }`}
      />
    </label>
  );
}
