import { ResolvedList } from "@/components/ResolvedList";
import { sectionClassName } from "@/components/sections";
import { TextField } from "@/components/TextField";
import { GROUP_CATEGORIES, GROUP_SCOPES } from "@/domain/group";
import type { GroupConfig, GroupPatch } from "@/domain/types";

interface GroupConfigSectionProps {
  group: GroupConfig;
  domainLabel: string;
  groupsDistinguishedName: string;
  onChange: (patch: GroupPatch) => void;
}

interface ChoiceFieldProps {
  id: string;
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}

function ChoiceField({ id, label, value, options, onChange }: ChoiceFieldProps) {
  const known = options.includes(value);

  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none ring-accent/25 focus-visible:border-accent focus-visible:ring-2"
      >
        {known ? null : <option value={value}>{value.trim() || "Not set"}</option>}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function GroupConfigSection({
  group,
  domainLabel,
  groupsDistinguishedName,
  onChange,
}: GroupConfigSectionProps) {
  return (
    <section id="groups" className={sectionClassName}>
      <article className="rounded-xl border border-line bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold tracking-tight">Groups</h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
          Configure the group created for this run. The command path is the groups
          destination distinguished name from AD Object Locations.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <TextField
              id="group-name"
              label="Group name"
              value={group.name}
              placeholder="Example Readers"
              onChange={(name) => onChange({ name })}
            />
          </div>
          <ChoiceField
            id="group-category"
            label="Group category"
            value={group.category}
            options={GROUP_CATEGORIES}
            onChange={(category) => onChange({ category })}
          />
          <ChoiceField
            id="group-scope"
            label="Group scope"
            value={group.scope}
            options={GROUP_SCOPES}
            onChange={(scope) => onChange({ scope })}
          />
          <div className="lg:col-span-2">
            <TextField
              id="group-description"
              label="Description"
              value={group.description}
              placeholder="What this group is for"
              onChange={(description) => onChange({ description })}
            />
          </div>
        </div>
        <div className="mt-4">
          <ResolvedList
            title="Groups destination distinguished name"
            note="Used as -Path on the New-ADGroup command. Edit the groups destination hierarchy to change it."
            rows={[
              {
                id: "group-path",
                label: domainLabel,
                value: groupsDistinguishedName || "No distinguished name yet",
              },
            ]}
          />
        </div>
      </article>
    </section>
  );
}
