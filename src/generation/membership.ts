import type { MigrationConfig } from "@/domain/types";
import { escapePowerShellDoubleQuoted } from "@/generation/group";
import type { GeneratedCommand } from "@/generation/types";

function forComment(value: string): string {
  return value.replaceAll("#>", "# >").replace(/[\r\n]+/g, " ");
}

function domainCommentName(identifier: string): string {
  const trimmed = identifier.trim();
  return trimmed.length > 0 ? forComment(trimmed) : "Domain";
}

function incompleteReasons(identity: string, member: string): string[] {
  const reasons: string[] = [];
  if (identity.length === 0) {
    reasons.push("The group identity has not been configured.");
  }
  if (member.length === 0) {
    reasons.push("The member account has not been configured.");
  }
  return reasons;
}

function membershipScript(config: MigrationConfig): string {
  const identity = config.groupMembership.identity.trim();
  const member = config.groupMembership.member.trim();
  const commentLines = [
    "<#",
    "  Group membership command.",
    `  Domain: ${domainCommentName(config.domain.identifier)}`,
  ];
  const reasons = incompleteReasons(identity, member);

  if (reasons.length > 0) {
    commentLines.push(
      ...reasons.map((reason) => `  ${reason}`),
      "  Review before execution. This application does not run PowerShell.",
      "#>",
    );
    return commentLines.join("\n");
  }

  commentLines.push(
    `  Identity: ${forComment(identity)}`,
    `  Member: ${forComment(member)}`,
    "  Review before execution. This application does not run PowerShell.",
    "#>",
    `Add-ADGroupMember -Identity "${escapePowerShellDoubleQuoted(identity)}" -Members "${escapePowerShellDoubleQuoted(member)}"`,
  );
  return commentLines.join("\n");
}

/** Add-ADGroupMember for the current run. It does not read the New-ADGroup configuration. */
export function generateMembershipCommand(config: MigrationConfig): GeneratedCommand {
  return {
    id: "add-group-member",
    title: "Add group member",
    script: membershipScript(config),
  };
}
