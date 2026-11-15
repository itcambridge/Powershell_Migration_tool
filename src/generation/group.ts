import { isGroupCategory, isGroupScope } from "@/domain/group";
import { buildGroupsDestinationDistinguishedName } from "@/domain/hierarchy";
import type { MigrationConfig } from "@/domain/types";
import type { GeneratedCommand } from "@/generation/types";

function forComment(value: string): string {
  return value.replaceAll("#>", "# >").replace(/[\r\n]+/g, " ");
}

/** Escapes a value for a PowerShell double-quoted string. */
export function escapePowerShellDoubleQuoted(value: string): string {
  return value
    .replaceAll("`", "``")
    .replaceAll('"', '`"')
    .replaceAll("$", "`$")
    .replaceAll("\r", "`r")
    .replaceAll("\n", "`n");
}

function domainCommentName(identifier: string): string {
  const trimmed = identifier.trim();
  return trimmed.length > 0 ? forComment(trimmed) : "Domain";
}

function incompleteReasons(config: MigrationConfig, path: string): string[] {
  const reasons: string[] = [];
  const category = config.group.category.trim();
  const scope = config.group.scope.trim();

  if (config.group.name.trim().length === 0) {
    reasons.push("The group name has not been configured.");
  }
  if (category.length === 0) {
    reasons.push("The group category has not been configured.");
  } else if (!isGroupCategory(category)) {
    reasons.push("The group category is not a recognised value.");
  }
  if (path.trim().length === 0) {
    reasons.push("The groups destination distinguished name has not been configured.");
  }
  if (scope.length === 0) {
    reasons.push("The group scope has not been configured.");
  } else if (!isGroupScope(scope)) {
    reasons.push("The group scope is not a recognised value.");
  }
  if (config.group.description.trim().length === 0) {
    reasons.push("The description has not been configured.");
  }

  return reasons;
}

function groupScript(config: MigrationConfig, path: string): string {
  const commentLines = [
    "<#",
    "  Group command.",
    `  Domain: ${domainCommentName(config.domain.identifier)}`,
  ];
  const reasons = incompleteReasons(config, path);

  if (reasons.length > 0) {
    commentLines.push(
      ...reasons.map((reason) => `  ${reason}`),
      "  Review before execution. This application does not run PowerShell.",
      "#>",
    );
    return commentLines.join("\n");
  }

  const name = config.group.name.trim();
  const description = config.group.description.trim();
  const category = config.group.category.trim();
  const scope = config.group.scope.trim();
  commentLines.push(
    `  Name: ${forComment(name)}`,
    `  Path: ${forComment(path)}`,
    "  Review before execution. This application does not run PowerShell.",
    "#>",
    [
      "New-ADGroup",
      `-Name "${escapePowerShellDoubleQuoted(name)}"`,
      `-GroupCategory ${category}`,
      `-Path "${escapePowerShellDoubleQuoted(path)}"`,
      `-GroupScope ${scope}`,
      `-Description "${escapePowerShellDoubleQuoted(description)}"`,
    ].join(" "),
  );
  return commentLines.join("\n");
}

/** New-ADGroup for the current run, using the groups destination distinguished name. */
export function generateGroupCommand(config: MigrationConfig): GeneratedCommand {
  const path = buildGroupsDestinationDistinguishedName(
    config.groupsOuLevels,
    config.domain.distinguishedName,
  );

  return {
    id: "create-group",
    title: "Create group",
    script: groupScript(config, path),
  };
}
