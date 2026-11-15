import { describe, expect, it } from "vitest";
import { initialMigrationConfig } from "@/domain/defaults";
import type { MigrationConfig } from "@/domain/types";
import {
  generateDirectoryCommand,
  generateGroupCommand,
  generateMembershipCommand,
  generateMigrationCommands,
  renderCommandSet,
} from "@/generation";

function commandLine(config: MigrationConfig = initialMigrationConfig): string {
  const script = generateMembershipCommand(config).script;
  const line = script.split("\n").find((entry) => entry.startsWith("Add-ADGroupMember"));
  if (!line) {
    throw new Error("expected an Add-ADGroupMember command");
  }
  return line;
}

describe("group membership generation", () => {
  it("builds a deterministic Add-ADGroupMember command", () => {
    const first = generateMembershipCommand(initialMigrationConfig);
    const second = generateMembershipCommand(initialMigrationConfig);

    expect(first).toEqual(second);
    expect(first.id).toBe("add-group-member");
    expect(commandLine()).toBe(
      'Add-ADGroupMember -Identity "Example Library" -Members "Example Reader"',
    );
    expect(first.script).toContain("Group membership command.");
    expect(first.script).toContain("This application does not run PowerShell.");
  });

  it("uses the configured group identity and member account", () => {
    const config: MigrationConfig = {
      ...initialMigrationConfig,
      groupMembership: {
        identity: "Example Archive",
        member: "Example Writer",
      },
    };

    expect(commandLine(config)).toBe(
      'Add-ADGroupMember -Identity "Example Archive" -Members "Example Writer"',
    );
  });

  it("escapes quotes, dollars, backticks, and line breaks", () => {
    const config: MigrationConfig = {
      ...initialMigrationConfig,
      groupMembership: {
        identity: 'A"B$C`E',
        member: "Line\r\nTwo",
      },
    };

    expect(commandLine(config)).toBe(
      'Add-ADGroupMember -Identity "A`"B`$C``E" -Members "Line`r`nTwo"',
    );
  });

  it("explains a missing group identity and does not emit Add-ADGroupMember", () => {
    const config: MigrationConfig = {
      ...initialMigrationConfig,
      groupMembership: { identity: "", member: "Example Reader" },
    };
    const script = generateMembershipCommand(config).script;

    expect(script).not.toContain("Add-ADGroupMember");
    expect(script).toContain("The group identity has not been configured.");
    expect(script).not.toContain("The member account has not been configured.");
  });

  it("explains a missing member account and does not emit Add-ADGroupMember", () => {
    const config: MigrationConfig = {
      ...initialMigrationConfig,
      groupMembership: { identity: "Example Library", member: "" },
    };
    const script = generateMembershipCommand(config).script;

    expect(script).not.toContain("Add-ADGroupMember");
    expect(script).toContain("The member account has not been configured.");
    expect(script).not.toContain("The group identity has not been configured.");
  });

  it("treats whitespace-only identity and member as missing", () => {
    const config: MigrationConfig = {
      ...initialMigrationConfig,
      groupMembership: { identity: " \t ", member: "\n" },
    };
    const script = generateMembershipCommand(config).script;

    expect(script).not.toContain("Add-ADGroupMember");
    expect(script).toContain("The group identity has not been configured.");
    expect(script).toContain("The member account has not been configured.");
  });

  it("does not follow the group creation name", () => {
    const config: MigrationConfig = {
      ...initialMigrationConfig,
      group: { ...initialMigrationConfig.group, name: "Example Writers" },
    };

    expect(generateMembershipCommand(config).script).toBe(
      generateMembershipCommand(initialMigrationConfig).script,
    );
    expect(commandLine(config)).toContain('-Identity "Example Library"');
    expect(commandLine(config)).not.toContain("Example Writers");
  });

  it("leaves the directory and group commands unchanged", () => {
    const config: MigrationConfig = {
      ...initialMigrationConfig,
      groupMembership: {
        identity: "Example Archive",
        member: "Example Writer",
      },
    };

    expect(generateDirectoryCommand(config).script).toBe(
      generateDirectoryCommand(initialMigrationConfig).script,
    );
    expect(generateGroupCommand(config).script).toBe(
      generateGroupCommand(initialMigrationConfig).script,
    );
  });

  it("includes the membership command in the combined script", () => {
    const commands = generateMigrationCommands(initialMigrationConfig);
    const commandSet = renderCommandSet(commands);

    expect(commands.map((command) => command.id)).toEqual([
      "create-directory",
      "create-group",
      "add-group-member",
    ]);
    expect(commandSet).toContain("New-Item -ItemType Directory");
    expect(commandSet).toContain("New-ADGroup");
    expect(commandSet).toContain(commandLine());
    expect(commandSet.startsWith("# Migration Command Builder\n")).toBe(true);
  });
});
