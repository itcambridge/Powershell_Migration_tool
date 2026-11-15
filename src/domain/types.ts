export interface DomainConfig {
  identifier: string;
  distinguishedName: string;
  fileServerRoot: string;
}

export type DomainPatch = Partial<DomainConfig>;

/** One row in an ordered folder or OU hierarchy. */
export interface HierarchyLevel {
  id: string;
  label: string;
  name: string;
}

export type HierarchyLevelPatch = Partial<Pick<HierarchyLevel, "label" | "name">>;

/** The security group created by the New-ADGroup command for this run. */
export interface GroupConfig {
  name: string;
  category: string;
  scope: string;
  description: string;
}

export type GroupPatch = Partial<GroupConfig>;

/** One account added to one group. Independent of the group created by New-ADGroup. */
export interface GroupMembershipConfig {
  identity: string;
  member: string;
}

export type GroupMembershipPatch = Partial<GroupMembershipConfig>;

/**
 * One migration run.
 * Folder, organisational OU, and object-destination hierarchies are independent ordered arrays.
 */
export interface MigrationConfig {
  domain: DomainConfig;
  folderLevels: readonly HierarchyLevel[];
  ouLevels: readonly HierarchyLevel[];
  groupsOuLevels: readonly HierarchyLevel[];
  accountsOuLevels: readonly HierarchyLevel[];
  group: GroupConfig;
  groupMembership: GroupMembershipConfig;
}
