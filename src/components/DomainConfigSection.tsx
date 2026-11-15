import { sectionClassName } from "@/components/sections";
import { TextField } from "@/components/TextField";
import type { DomainConfig, DomainPatch } from "@/domain/types";

interface DomainConfigSectionProps {
  domain: DomainConfig;
  onChange: (patch: DomainPatch) => void;
}

export function DomainConfigSection({ domain, onChange }: DomainConfigSectionProps) {
  return (
    <section id="domain" className={sectionClassName}>
      <article className="rounded-xl border border-line bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold tracking-tight">Domain</h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
          This run uses one domain. Set its identifier, distinguished name, and file
          server root. A later run can use a different domain.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <TextField
            id="domain-identifier"
            label="Identifier"
            value={domain.identifier}
            placeholder="EXAMPLE"
            onChange={(identifier) => onChange({ identifier })}
          />
          <TextField
            id="domain-dn"
            label="Distinguished name"
            value={domain.distinguishedName}
            placeholder="DC=example,DC=local"
            mono
            onChange={(distinguishedName) => onChange({ distinguishedName })}
          />
          <TextField
            id="domain-root"
            label="File server root"
            value={domain.fileServerRoot}
            placeholder="\\\\fs01\\shares"
            mono
            onChange={(fileServerRoot) => onChange({ fileServerRoot })}
          />
        </div>
      </article>
    </section>
  );
}
