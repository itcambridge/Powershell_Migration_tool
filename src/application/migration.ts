import {
  bottomLevel,
  buildAccountsDestinationDistinguishedName,
  buildFolderPath,
  buildGroupsDestinationDistinguishedName,
  buildOrganisationalTargetDistinguishedName,
} from "@/domain/hierarchy";
import { initialMigrationConfig } from "@/domain/defaults";
import type {
  DomainConfig,
  DomainPatch,
  GroupMembershipPatch,
  GroupPatch,
  HierarchyLevel,
  MigrationConfig,
} from "@/domain/types";
import { generateMigrationCommands, renderCommandSet } from "@/generation";
import type { GeneratedCommand } from "@/generation";

export interface MigrationView {
  label: string;
  folderPath: string;
  organisationalTargetOuDistinguishedName: string;
  groupsDestinationOuDistinguishedName: string;
  accountsDestinationOuDistinguishedName: string;
  bottomOuLabel: string;
  bottomOuName: string;
  commands: readonly GeneratedCommand[];
  commandSet: string;
}

function copyLevels(levels: readonly HierarchyLevel[]): HierarchyLevel[] {
  return levels.map((level) => ({ ...level }));
}

function domainLabel(domain: DomainConfig): string {
  const identifier = domain.identifier.trim();
  return identifier.length > 0 ? identifier : "Domain";
}

/** A new run. The returned object does not share nested values with the example or other runs. */
export function createMigrationRun(): MigrationConfig {
  return {
    domain: { ...initialMigrationConfig.domain },
    folderLevels: copyLevels(initialMigrationConfig.folderLevels),
    ouLevels: copyLevels(initialMigrationConfig.ouLevels),
    groupsOuLevels: copyLevels(initialMigrationConfig.groupsOuLevels),
    accountsOuLevels: copyLevels(initialMigrationConfig.accountsOuLevels),
    group: { ...initialMigrationConfig.group },
    groupMembership: { ...initialMigrationConfig.groupMembership },
  };
}

export function updateDomain(config: MigrationConfig, patch: DomainPatch): MigrationConfig {
  return {
    ...config,
    domain: { ...config.domain, ...patch },
  };
}

export function updateGroup(config: MigrationConfig, patch: GroupPatch): MigrationConfig {
  return {
    ...config,
    group: { ...config.group, ...patch },
  };
}

export function updateGroupMembership(
  config: MigrationConfig,
  patch: GroupMembershipPatch,
): MigrationConfig {
  return {
    ...config,
    groupMembership: { ...config.groupMembership, ...patch },
  };
}

/** Resolves the path, distinguished names, and PowerShell for one run. */
export function deriveMigration(config: MigrationConfig): MigrationView {
  const domainDn = config.domain.distinguishedName;
  const bottom = bottomLevel(config.ouLevels);
  const commands = generateMigrationCommands(config);

  return {
    label: domainLabel(config.domain),
    folderPath: buildFolderPath(config.domain.fileServerRoot, config.folderLevels),
    organisationalTargetOuDistinguishedName: buildOrganisationalTargetDistinguishedName(
      config.ouLevels,
      domainDn,
    ),
    groupsDestinationOuDistinguishedName: buildGroupsDestinationDistinguishedName(
      config.groupsOuLevels,
      domainDn,
    ),
    accountsDestinationOuDistinguishedName: buildAccountsDestinationDistinguishedName(
      config.accountsOuLevels,
      domainDn,
    ),
    bottomOuLabel: bottom?.label.trim() ?? "",
    bottomOuName: bottom?.name.trim() ?? "",
    commands,
    commandSet: renderCommandSet(commands),
  };
}
