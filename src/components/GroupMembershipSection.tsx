import { sectionClassName } from "@/components/sections";
import { TextField } from "@/components/TextField";
import type { GroupMembershipConfig, GroupMembershipPatch } from "@/domain/types";

interface GroupMembershipSectionProps {
  membership: GroupMembershipConfig;
  onChange: (patch: GroupMembershipPatch) => void;
}

export function GroupMembershipSection({ membership, onChange }: GroupMembershipSectionProps) {
  return (
    <section id="membership" className={sectionClassName}>
      <article className="rounded-xl border border-line bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold tracking-tight">Group membership</h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
          Choose the group that receives a member, and the account to add. This identity
          is not taken from the group created in the Groups section.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <TextField
            id="membership-identity"
            label="Group identity"
            value={membership.identity}
            placeholder="Example Library"
            onChange={(identity) => onChange({ identity })}
          />
          <TextField
            id="membership-member"
            label="Member account"
            value={membership.member}
            placeholder="Example Reader"
            onChange={(member) => onChange({ member })}
          />
        </div>
      </article>
    </section>
  );
}
