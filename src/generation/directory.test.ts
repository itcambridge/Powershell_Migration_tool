import { describe, expect, it } from "vitest";
import { initialMigrationConfig } from "@/domain/defaults";
import type { MigrationConfig } from "@/domain/types";
import {
  generateDirectoryCommand,
  generateMigrationCommands,
  renderCommandSet,
} from "@/generation";

const examplePath = "\\\\fs01\\deptshares\\North\\Manchester\\Finance";

function scriptFor(domain: string, folderPath: string): string {
  return [
    "<#",
    "  Demonstration directory command.",
    `  Domain: ${domain}`,
    `  Path: ${folderPath}`,
    "  Review before execution. This application does not run PowerShell.",
    "#>",
    `New-Item -ItemType Directory -Path '${folderPath}' -Force`,
  ].join("\n");
}

describe("directory generation", () => {
  it("builds a deterministic directory command from the run configuration", () => {
    const first = generateDirectoryCommand(initialMigrationConfig);
    const second = generateDirectoryCommand(initialMigrationConfig);

    expect(first).toEqual(second);
    expect(first.script).toBe(scriptFor("CONTOSO", examplePath));
    expect(first.id).toBe("create-directory");
  });

  it("uses the configured identifier and file server root", () => {
    const config: MigrationConfig = {
      ...initialMigrationConfig,
      domain: {
        identifier: "WIDEWORLD",
        distinguishedName: "DC=wideworld,DC=example",
        fileServerRoot: "\\\\fs09\\shares",
      },
    };

    const script = generateDirectoryCommand(config).script;

    expect(script).toContain("Domain: WIDEWORLD");
    expect(script).toContain("\\\\fs09\\shares\\North\\Manchester\\Finance");
    expect(script).not.toContain("CONTOSO");
  });

  it("doubles single quotes inside the PowerShell path literal", () => {
    const config: MigrationConfig = {
      ...initialMigrationConfig,
      folderLevels: [{ id: "team", label: "Team", name: "O'Brien" }],
    };

    const script = generateDirectoryCommand(config).script;

    expect(script).toContain(
      "New-Item -ItemType Directory -Path '\\\\fs01\\deptshares\\O''Brien' -Force",
    );
  });

  it("keeps the directory command stable when only the OU hierarchy changes", () => {
    const changed: MigrationConfig = {
      ...initialMigrationConfig,
      ouLevels: [{ id: "only", label: "Team", name: "Payroll" }],
    };

    expect(generateDirectoryCommand(changed).script).toBe(
      generateDirectoryCommand(initialMigrationConfig).script,
    );
  });

  it("creates the file server root when the folder hierarchy is empty", () => {
    const config: MigrationConfig = {
      ...initialMigrationConfig,
      folderLevels: [],
    };

    expect(generateDirectoryCommand(config).script).toBe(
      scriptFor("CONTOSO", "\\\\fs01\\deptshares"),
    );
  });

  it("does not emit New-Item when the folder hierarchy and file server root are empty", () => {
    const config: MigrationConfig = {
      ...initialMigrationConfig,
      domain: { ...initialMigrationConfig.domain, fileServerRoot: "" },
      folderLevels: [],
    };

    const script = generateDirectoryCommand(config).script;

    expect(script).toBe(
      [
        "<#",
        "  Demonstration directory command.",
        "  Domain: CONTOSO",
        "  The directory path has not been configured.",
        "  Review before execution. This application does not run PowerShell.",
        "#>",
      ].join("\n"),
    );
    expect(script).not.toContain("New-Item");
  });

  it("does not emit New-Item when the root and folder names are only whitespace", () => {
    const config: MigrationConfig = {
      ...initialMigrationConfig,
      domain: { ...initialMigrationConfig.domain, fileServerRoot: " \t " },
      folderLevels: [
        { id: "region", label: "Region", name: " " },
        { id: "site", label: "Site", name: "\t" },
      ],
    };

    const script = generateDirectoryCommand(config).script;

    expect(script).not.toContain("New-Item");
    expect(script).toContain("The directory path has not been configured.");
    expect(script).toContain("Demonstration directory command.");
    expect(script).toContain("This application does not run PowerShell.");
  });

  it("returns the run command set", () => {
    const commands = generateMigrationCommands(initialMigrationConfig);
    const commandSet = renderCommandSet(commands);

    expect(commands.map((command) => command.id)).toEqual([
      "create-directory",
      "create-group",
      "add-group-member",
    ]);
    expect(commands[0]?.script).toBe(generateDirectoryCommand(initialMigrationConfig).script);
    expect(commandSet.startsWith("# Migration Command Builder\n")).toBe(true);
    expect(commandSet).toContain(examplePath);
    expect(commandSet.endsWith("\n")).toBe(true);
  });
});
