import type { HierarchyLevel, HierarchyLevelPatch } from "@/domain/types";

/**
 * Escapes a single OU name for use as an RDN value.
 * The domain DN is not passed through this function; it is an engineer-supplied suffix.
 */
export function escapeDistinguishedNameValue(value: string): string {
  let escaped = value
    .replaceAll("\\", "\\\\")
    .replaceAll(",", "\\,")
    .replaceAll("+", "\\+")
    .replaceAll('"', '\\"')
    .replaceAll("<", "\\<")
    .replaceAll(">", "\\>")
    .replaceAll(";", "\\;")
    .replaceAll("=", "\\=");

  if (escaped.startsWith("#")) {
    escaped = `\\${escaped}`;
  }

  let start = 0;
  while (start < escaped.length && escaped[start] === " ") {
    start += 1;
  }

  let end = escaped.length;
  while (end > start && escaped[end - 1] === " ") {
    end -= 1;
  }

  const leading = "\\ ".repeat(start);
  const trailing = "\\ ".repeat(escaped.length - end);
  return `${leading}${escaped.slice(start, end)}${trailing}`;
}

function folderSegment(name: string): string {
  return name.trim().replace(/^[\\/]+|[\\/]+$/g, "");
}

/**
 * Joins a file server root with folder names in level order.
 * Blank names are omitted. The root keeps a leading UNC prefix.
 */
export function buildFolderPath(
  fileServerRoot: string,
  levels: readonly HierarchyLevel[],
): string {
  const root = fileServerRoot.trim().replace(/[\\/]+$/, "");
  const names = levels
    .map((level) => folderSegment(level.name))
    .filter((name) => name.length > 0);

  if (root.length === 0) {
    return names.join("\\");
  }

  if (names.length === 0) {
    return root;
  }

  return `${root}\\${names.join("\\")}`;
}

/**
 * Builds a distinguished name from parent-to-child OU levels.
 * The last non-blank level becomes the leftmost OU. The domain DN is appended raw.
 */
export function buildDistinguishedName(
  levels: readonly HierarchyLevel[],
  domainDistinguishedName: string,
): string {
  const ouParts = [...levels]
    .reverse()
    .map((level) => level.name.trim())
    .filter((name) => name.length > 0)
    .map((name) => `OU=${escapeDistinguishedNameValue(name)}`);

  const domainDn = domainDistinguishedName.trim();
  if (domainDn.length === 0) {
    return ouParts.join(",");
  }

  return [...ouParts, domainDn].join(",");
}

/** DN for the organisational OU hierarchy only. */
export function buildOrganisationalTargetDistinguishedName(
  levels: readonly HierarchyLevel[],
  domainDistinguishedName: string,
): string {
  return buildDistinguishedName(levels, domainDistinguishedName);
}

/** DN for the groups destination hierarchy only. */
export function buildGroupsDestinationDistinguishedName(
  levels: readonly HierarchyLevel[],
  domainDistinguishedName: string,
): string {
  return buildDistinguishedName(levels, domainDistinguishedName);
}

/** DN for the accounts destination hierarchy only. */
export function buildAccountsDestinationDistinguishedName(
  levels: readonly HierarchyLevel[],
  domainDistinguishedName: string,
): string {
  return buildDistinguishedName(levels, domainDistinguishedName);
}

/** Last non-blank OU or folder level. This is the migration target OU. */
export function bottomLevel(
  levels: readonly HierarchyLevel[],
): HierarchyLevel | undefined {
  for (let index = levels.length - 1; index >= 0; index -= 1) {
    const level = levels[index];
    if (level && level.name.trim().length > 0) {
      return level;
    }
  }

  return undefined;
}

export function createHierarchyLevel(label: string, name = ""): HierarchyLevel {
  return {
    id: crypto.randomUUID(),
    label,
    name,
  };
}

export function updateLevel(
  levels: readonly HierarchyLevel[],
  id: string,
  patch: HierarchyLevelPatch,
): HierarchyLevel[] {
  return levels.map((level) => (level.id === id ? { ...level, ...patch } : level));
}

export function removeLevel(
  levels: readonly HierarchyLevel[],
  id: string,
): HierarchyLevel[] {
  return levels.filter((level) => level.id !== id);
}

export function moveLevel(
  levels: readonly HierarchyLevel[],
  id: string,
  direction: -1 | 1,
): HierarchyLevel[] {
  const index = levels.findIndex((level) => level.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= levels.length) {
    return [...levels];
  }

  const next = [...levels];
  const current = next[index];
  if (!current) {
    return next;
  }

  next.splice(index, 1);
  next.splice(target, 0, current);
  return next;
}
