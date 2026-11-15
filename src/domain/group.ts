/** Active Directory group categories accepted by New-ADGroup. */
export const GROUP_CATEGORIES = ["Security", "Distribution"] as const;

/** Active Directory group scopes accepted by New-ADGroup. */
export const GROUP_SCOPES = ["DomainLocal", "Global", "Universal"] as const;

export type GroupCategory = (typeof GROUP_CATEGORIES)[number];
export type GroupScope = (typeof GROUP_SCOPES)[number];

export function isGroupCategory(value: string): value is GroupCategory {
  return (GROUP_CATEGORIES as readonly string[]).includes(value);
}

export function isGroupScope(value: string): value is GroupScope {
  return (GROUP_SCOPES as readonly string[]).includes(value);
}
