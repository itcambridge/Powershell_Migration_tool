import type { MigrationConfig } from "@/domain/types";
import { generateDirectoryCommand } from "@/generation/directory";
import { generateGroupCommand } from "@/generation/group";
import { generateMembershipCommand } from "@/generation/membership";
import type { GeneratedCommand } from "@/generation/types";

export type { GeneratedCommand } from "@/generation/types";
export { generateDirectoryCommand } from "@/generation/directory";
export { generateGroupCommand } from "@/generation/group";
export { generateMembershipCommand } from "@/generation/membership";

/** Registers every generator for the current run. Add new command functions here. */
export function generateMigrationCommands(
  config: MigrationConfig,
): GeneratedCommand[] {
  return [
    generateDirectoryCommand(config),
    generateGroupCommand(config),
    generateMembershipCommand(config),
  ];
}

/** Full script used for copy-all and .ps1 export. */
export function renderCommandSet(commands: readonly GeneratedCommand[]): string {
  const body = commands.map((command) => command.script.trimEnd()).join("\n\n");

  return [
    "# Migration Command Builder",
    "# Generated for engineer review. This file is not executed by the application.",
    "# Review each command before running it on the appropriate server.",
    "",
    body,
    "",
  ].join("\n");
}
