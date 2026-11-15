import { describe, expect, it } from "vitest";
import { initialMigrationConfig } from "@/domain/defaults";
import type { MigrationConfig } from "@/domain/types";
import {
  generateDirectoryCommand,
  generateGroupCommand,
  generateMigrationCommands,
  renderCommandSet,
} from "@/generation";

const groupsPath = "OU=Groups,OU=Operations,DC=contoso,DC=example";

function commandLine(config: MigrationConfig = initialMigrationConfig): string {
  const script = generateGroupCommand(config).script;
  const line = script.split("\n").find((entry) => entry.startsWith("New-ADGroup"));
  if (!line) {
    throw new Error("expected a New-ADGroup command");
  }
  return line;
}

describe("group generation", () => {
  it("builds a deterministic New-ADGroup command from the run", () => {
    const first = generateGroupCommand(initialMigrationConfig);
    const second = generateGroupCommand(initialMigrationConfig);
    const line = commandLine();

    expect(first).toEqual(second);
    expect(first.id).toBe("create-group");
    expect(line).toBe(
      `New-ADGroup -Name "Example Readers" -GroupCategory Security -Path "${groupsPath}" -GroupScope DomainLocal -Description "Demonstration security group for this run."`,
    );
  });

  it("uses the groups destination distinguished name for hierarchies of different depths", () => {
    const shallow: MigrationConfig = {
      ...initialMigrationConfig,
      groupsOuLevels: [{ id: "only", label: "Container", name: "Groups" }],
    };
    const deep: MigrationConfig = {
      ...initialMigrationConfig,
      groupsOuLevels: [
        { id: "a", label: "Division", name: "Operations" },
        { id: "b", label: "Department", name: "Finance" },
        { id: "c", label: "Team", name: "Payroll" },
        { id: "d", label: "Container", name: "Groups" },
      ],
    };

    expect(commandLine(shallow)).toContain(
      '-Path "OU=Groups,DC=contoso,DC=example"',
    );
    expect(commandLine(deep)).toContain(
      '-Path "OU=Groups,OU=Payroll,OU=Finance,OU=Operations,DC=contoso,DC=example"',
    );
    expect(commandLine(deep)).not.toContain("OU=Accounts");
  });

  it("does not use the organisational hierarchy as the group path", () => {
    const config: MigrationConfig = {
      ...initialMigrationConfig,
      ouLevels: [{ id: "only", label: "Team", name: "Somewhere Else" }],
    };

    expect(generateGroupCommand(config).script).toBe(
      generateGroupCommand(initialMigrationConfig).script,
    );
  });

  it("escapes quotes, dollars, and backticks in the group name", () => {
    const config: MigrationConfig = {
      ...initialMigrationConfig,
      group: { ...initialMigrationConfig.group, name: 'A"B$C`E' },
    };

    expect(commandLine(config)).toContain('-Name "A`"B`$C``E"');
  });

  it("escapes quotes, dollars, and newlines in the description", () => {
    const config: MigrationConfig = {
      ...initialMigrationConfig,
      group: {
        ...initialMigrationConfig.group,
        description: 'Says "hello" and costs $1\nNext',
      },
    };

    expect(commandLine(config)).toContain(
      '-Description "Says `"hello`" and costs `$1`nNext"',
    );
  });

  it("keeps a distinguished-name backslash inside the PowerShell string", () => {
    const config: MigrationConfig = {
      ...initialMigrationConfig,
      groupsOuLevels: [{ id: "container", label: "Container", name: "Groups, UK" }],
    };

    expect(commandLine(config)).toContain(
      '-Path "OU=Groups\\, UK,DC=contoso,DC=example"',
    );
  });

  it("uses the configured category and scope", () => {
    const config: MigrationConfig = {
      ...initialMigrationConfig,
      group: {
        ...initialMigrationConfig.group,
        category: "Distribution",
        scope: "Global",
      },
    };
    const line = commandLine(config);

    expect(line).toContain("-GroupCategory Distribution");
    expect(line).toContain("-GroupScope Global");
    expect(line).not.toContain("Security");
    expect(line).not.toContain("DomainLocal");
  });

  it("explains which values are missing and does not emit New-ADGroup", () => {
    const config: MigrationConfig = {
      ...initialMigrationConfig,
      domain: { ...initialMigrationConfig.domain, distinguishedName: "  " },
      groupsOuLevels: [],
      group: {
        name: " ",
        category: "",
        scope: "Local",
        description: "\n",
      },
    };

    const script = generateGroupCommand(config).script;

    expect(script).not.toContain("New-ADGroup");
    expect(script).toContain("The group name has not been configured.");
    expect(script).toContain("The group category has not been configured.");
    expect(script).toContain(
      "The groups destination distinguished name has not been configured.",
    );
    expect(script).toContain("The group scope is not a recognised value.");
    expect(script).toContain("The description has not been configured.");
    expect(script).toContain("This application does not run PowerShell.");
  });

  it("names an unrecognised category without emitting a command", () => {
    const config: MigrationConfig = {
      ...initialMigrationConfig,
      group: { ...initialMigrationConfig.group, category: "Mail" },
    };
    const script = generateGroupCommand(config).script;

    expect(script).not.toContain("New-ADGroup");
    expect(script).toContain("The group category is not a recognised value.");
  });

  it("leaves the directory command unchanged and includes both scripts in the export text", () => {
    const commands = generateMigrationCommands(initialMigrationConfig);
    const commandSet = renderCommandSet(commands);
    const directory = generateDirectoryCommand(initialMigrationConfig);

    expect(commands[0]).toEqual(directory);
    expect(commandSet).toContain(directory.script);
    expect(commandSet).toContain(commandLine());
    expect(commandSet.startsWith("# Migration Command Builder\n")).toBe(true);
    expect(commandSet).toContain("This file is not executed by the application.");
  });
});
