import type { MigrationConfig } from "@/domain/types";

/**
 * Fictional starting values so a new run has a readable preview.
 * These strings are example data. The application does not treat them as known organisations.
 */
export const initialMigrationConfig: MigrationConfig = {
  domain: {
    identifier: "CONTOSO",
    distinguishedName: "DC=contoso,DC=example",
    fileServerRoot: "\\\\fs01\\deptshares",
  },
  folderLevels: [
    { id: "folder-region", label: "Region", name: "North" },
    { id: "folder-site", label: "Site", name: "Manchester" },
    { id: "folder-team", label: "Team", name: "Finance" },
  ],
  ouLevels: [
    { id: "ou-division", label: "Division", name: "Operations" },
    { id: "ou-department", label: "Department", name: "Finance" },
    { id: "ou-team", label: "Team", name: "Payroll" },
  ],
  groupsOuLevels: [
    { id: "groups-division", label: "Division", name: "Operations" },
    { id: "groups-container", label: "Container", name: "Groups" },
  ],
  accountsOuLevels: [
    { id: "accounts-division", label: "Division", name: "Operations" },
    { id: "accounts-department", label: "Department", name: "Finance" },
    { id: "accounts-team", label: "Team", name: "Payroll" },
    { id: "accounts-container", label: "Container", name: "Accounts" },
  ],
  group: {
    name: "Example Readers",
    category: "Security",
    scope: "DomainLocal",
    description: "Demonstration security group for this run.",
  },
  groupMembership: {
    identity: "Example Library",
    member: "Example Reader",
  },
};
