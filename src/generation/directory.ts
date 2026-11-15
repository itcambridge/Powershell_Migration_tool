import { buildFolderPath } from "@/domain/hierarchy";
import type { DomainConfig, MigrationConfig } from "@/domain/types";
import type { GeneratedCommand } from "@/generation/types";

function forComment(value: string): string {
  return value.replaceAll("#>", "# >").replace(/[\r\n]+/g, " ");
}

export function escapePowerShellSingleQuoted(value: string): string {
  return value.replaceAll("'", "''");
}

function domainCommentName(domain: DomainConfig): string {
  const identifier = domain.identifier.trim();
  if (identifier.length > 0) {
    return forComment(identifier);
  }

  return "Domain";
}

function directoryScript(domain: DomainConfig, folderPath: string): string {
  const commentLines = [
    "<#",
    "  Demonstration directory command.",
    `  Domain: ${domainCommentName(domain)}`,
  ];

  if (folderPath.trim().length === 0) {
    commentLines.push(
      "  The directory path has not been configured.",
      "  Review before execution. This application does not run PowerShell.",
      "#>",
    );
    return commentLines.join("\n");
  }

  const literal = escapePowerShellSingleQuoted(folderPath);
  commentLines.push(
    `  Path: ${forComment(folderPath)}`,
    "  Review before execution. This application does not run PowerShell.",
    "#>",
    `New-Item -ItemType Directory -Path '${literal}' -Force`,
  );
  return commentLines.join("\n");
}

/** Demonstration directory rule for the current run. Replace when an approved rule exists. */
export function generateDirectoryCommand(config: MigrationConfig): GeneratedCommand {
  const folderPath = buildFolderPath(config.domain.fileServerRoot, config.folderLevels);

  return {
    id: "create-directory",
    title: "Create migration directory",
    script: directoryScript(config.domain, folderPath),
  };
}
