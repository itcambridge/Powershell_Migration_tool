import { describe, expect, it } from "vitest";
import {
  createMigrationRun,
  deriveMigration,
  updateDomain,
  updateGroup,
  updateGroupMembership,
} from "@/application/migration";
import { initialMigrationConfig } from "@/domain/defaults";
import type { MigrationConfig } from "@/domain/types";

describe("deriveMigration", () => {
  it("resolves one folder path and one target distinguished name", () => {
    const view = deriveMigration(initialMigrationConfig);

    expect(view.label).toBe("CONTOSO");
    expect(view.folderPath).toBe("\\\\fs01\\deptshares\\North\\Manchester\\Finance");
    expect(view.organisationalTargetOuDistinguishedName).toBe(
      "OU=Payroll,OU=Finance,OU=Operations,DC=contoso,DC=example",
    );
    expect(view.groupsDestinationOuDistinguishedName).toBe(
      "OU=Groups,OU=Operations,DC=contoso,DC=example",
    );
    expect(view.accountsDestinationOuDistinguishedName).toBe(
      "OU=Accounts,OU=Payroll,OU=Finance,OU=Operations,DC=contoso,DC=example",
    );
    expect(view.bottomOuLabel).toBe("Team");
    expect(view.bottomOuName).toBe("Payroll");
    expect(view.commands.map((command) => command.id)).toEqual([
      "create-directory",
      "create-group",
      "add-group-member",
    ]);
    expect(view.commandSet).toContain("New-Item -ItemType Directory");
    expect(view.commandSet).toContain("New-ADGroup");
    expect(view.commandSet).toContain("Add-ADGroupMember");
  });

  it("allows folder and OU hierarchies to have different depths", () => {
    const config: MigrationConfig = {
      ...initialMigrationConfig,
      folderLevels: [{ id: "folder", label: "Share", name: "Projects" }],
      ouLevels: [
        { id: "ou-1", label: "Region", name: "North" },
        { id: "ou-2", label: "Country", name: "UK" },
        { id: "ou-3", label: "City", name: "Manchester" },
        { id: "ou-4", label: "Team", name: "Finance" },
      ],
    };

    const view = deriveMigration(config);

    expect(view.folderPath).toBe("\\\\fs01\\deptshares\\Projects");
    expect(view.organisationalTargetOuDistinguishedName).toBe(
      "OU=Finance,OU=Manchester,OU=UK,OU=North,DC=contoso,DC=example",
    );
    expect(view.groupsDestinationOuDistinguishedName).toBe(
      "OU=Groups,OU=Operations,DC=contoso,DC=example",
    );
    expect(view.accountsDestinationOuDistinguishedName).toBe(
      "OU=Accounts,OU=Payroll,OU=Finance,OU=Operations,DC=contoso,DC=example",
    );
    expect(view.commands[0]?.script).toContain("\\\\fs01\\deptshares\\Projects");
    expect(view.commands[0]?.script).not.toContain("OU=Finance");
  });

  it("keeps the other destination distinguished names when one hierarchy changes", () => {
    const config: MigrationConfig = {
      ...initialMigrationConfig,
      groupsOuLevels: [{ id: "only", label: "Container", name: "Security" }],
    };
    const view = deriveMigration(config);
    const unchanged = deriveMigration(initialMigrationConfig);

    expect(view.groupsDestinationOuDistinguishedName).toBe(
      "OU=Security,DC=contoso,DC=example",
    );
    expect(view.organisationalTargetOuDistinguishedName).toBe(
      unchanged.organisationalTargetOuDistinguishedName,
    );
    expect(view.accountsDestinationOuDistinguishedName).toBe(
      unchanged.accountsDestinationOuDistinguishedName,
    );
  });

  it("updates the domain on the current run", () => {
    const next = updateDomain(initialMigrationConfig, {
      fileServerRoot: "\\\\fs01\\archive",
    });
    const view = deriveMigration(next);

    expect(view.folderPath.startsWith("\\\\fs01\\archive\\")).toBe(true);
    expect(next.folderLevels).toEqual(initialMigrationConfig.folderLevels);
    expect(next.ouLevels).toEqual(initialMigrationConfig.ouLevels);
    expect(next.groupsOuLevels).toEqual(initialMigrationConfig.groupsOuLevels);
    expect(next.accountsOuLevels).toEqual(initialMigrationConfig.accountsOuLevels);
    expect(next.group).toEqual(initialMigrationConfig.group);
    expect(next.groupMembership).toEqual(initialMigrationConfig.groupMembership);
  });

  it("updates the group without changing the destination hierarchies", () => {
    const next = updateGroup(initialMigrationConfig, {
      name: "Example Writers",
      scope: "Global",
    });

    expect(next.group).toEqual({
      ...initialMigrationConfig.group,
      name: "Example Writers",
      scope: "Global",
    });
    expect(next.groupsOuLevels).toEqual(initialMigrationConfig.groupsOuLevels);
    expect(next.ouLevels).toEqual(initialMigrationConfig.ouLevels);
    expect(next.accountsOuLevels).toEqual(initialMigrationConfig.accountsOuLevels);
    expect(next.folderLevels).toEqual(initialMigrationConfig.folderLevels);
    expect(next.groupMembership).toEqual(initialMigrationConfig.groupMembership);
  });

  it("updates group membership without changing the group being created", () => {
    const next = updateGroupMembership(initialMigrationConfig, {
      identity: "Example Archive",
      member: "Example Writer",
    });

    expect(next.groupMembership).toEqual({
      identity: "Example Archive",
      member: "Example Writer",
    });
    expect(next.group).toEqual(initialMigrationConfig.group);
    expect(next.groupsOuLevels).toEqual(initialMigrationConfig.groupsOuLevels);
  });
});

describe("createMigrationRun", () => {
  it("starts from the fictional example and stays independent of other runs", () => {
    const first = createMigrationRun();
    const second = createMigrationRun();

    first.domain.identifier = "CHANGED";
    const folder = first.folderLevels[0];
    const ou = first.ouLevels[0];
    const groups = first.groupsOuLevels[0];
    const accounts = first.accountsOuLevels[0];
    if (folder) {
      folder.name = "CHANGED";
    }
    if (ou) {
      ou.name = "CHANGED";
    }
    if (groups) {
      groups.name = "CHANGED";
    }
    if (accounts) {
      accounts.name = "CHANGED";
    }
    first.group.name = "CHANGED";
    first.groupMembership.identity = "CHANGED";

    expect(second.domain).toEqual(initialMigrationConfig.domain);
    expect(second.folderLevels[0]?.name).toBe("North");
    expect(second.ouLevels[0]?.name).toBe("Operations");
    expect(second.groupsOuLevels[0]?.name).toBe("Operations");
    expect(second.accountsOuLevels.map((level) => level.name)).toEqual([
      "Operations",
      "Finance",
      "Payroll",
      "Accounts",
    ]);
    expect(second.group).toEqual(initialMigrationConfig.group);
    expect(second.groupMembership).toEqual(initialMigrationConfig.groupMembership);
    expect(initialMigrationConfig.domain.identifier).toBe("CONTOSO");
    expect(initialMigrationConfig.group.name).toBe("Example Readers");
    expect(initialMigrationConfig.groupMembership.identity).toBe("Example Library");
  });
});
