interface ResolvedRow {
  id: string;
  label: string;
  value: string;
}

interface ResolvedListProps {
  title: string;
  note?: string;
  rows: readonly ResolvedRow[];
}

export function ResolvedList({ title, note, rows }: ResolvedListProps) {
  return (
    <div className="mt-5 rounded-lg border border-accent/20 bg-accent-soft px-4 py-3">
      <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-accent">{title}</h3>
      {note ? <p className="mt-1 text-xs leading-5 text-muted">{note}</p> : null}
      <dl className="mt-3 space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="grid gap-1 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-3">
            <dt className="text-sm font-medium text-ink">{row.label}</dt>
            <dd className="min-w-0 break-all font-mono text-sm text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
