import { describe, expect, it } from "vitest";
import {
  buildAccountsDestinationDistinguishedName,
  buildGroupsDestinationDistinguishedName,
  buildOrganisationalTargetDistinguishedName,
  moveLevel,
  removeLevel,
} from "@/domain/hierarchy";
import type { HierarchyLevel } from "@/domain/types";

function level(id: string, label: string, name: string): HierarchyLevel {
  return { id, label, name };
}

const domainDn = "DC=work,DC=com";

describe("destination distinguished names", () => {
  const organisational = [
    level("1", "Division", "Operations"),
    level("2", "Department", "Finance"),
  ];
  const groups = [level("1", "Division", "Operations"), level("2", "Container", "Groups")];
  const accounts = [
    level("1", "Division", "Operations"),
    level("2", "Department", "Finance"),
    level("3", "Team", "Payroll"),
    level("4", "Container", "Accounts"),
  ];

  it("builds each hierarchy in child-first order and appends the domain DN", () => {
    expect(buildOrganisationalTargetDistinguishedName(organisational, domainDn)).toBe(
      "OU=Finance,OU=Operations,DC=work,DC=com",
    );
    expect(buildGroupsDestinationDistinguishedName(groups, domainDn)).toBe(
      "OU=Groups,OU=Operations,DC=work,DC=com",
    );
    expect(buildAccountsDestinationDistinguishedName(accounts, domainDn)).toBe(
      "OU=Accounts,OU=Payroll,OU=Finance,OU=Operations,DC=work,DC=com",
    );
  });

  it("skips blank names instead of inserting an empty OU", () => {
    expect(
      buildGroupsDestinationDistinguishedName(
        [level("1", "Division", "Operations"), level("2", "Container", "   ")],
        domainDn,
      ),
    ).toBe("OU=Operations,DC=work,DC=com");
  });

  it("does not borrow levels from another hierarchy when one list is empty", () => {
    expect(buildGroupsDestinationDistinguishedName([], domainDn)).toBe(domainDn);
    expect(buildAccountsDestinationDistinguishedName([], domainDn)).toBe(domainDn);
    expect(buildOrganisationalTargetDistinguishedName(organisational, domainDn)).toBe(
      "OU=Finance,OU=Operations,DC=work,DC=com",
    );
  });

  it("escapes special characters in the hierarchy that owns the name", () => {
    const escaped = buildGroupsDestinationDistinguishedName(
      [level("1", "Container", "Groups, UK")],
      domainDn,
    );

    expect(escaped).toBe("OU=Groups\\, UK,DC=work,DC=com");
    expect(buildOrganisationalTargetDistinguishedName(organisational, domainDn)).not.toContain(
      "Groups",
    );
  });

  it("changes only the distinguished name of the hierarchy that is edited", () => {
    const reordered = moveLevel(groups, "2", -1);
    const withoutGroups = removeLevel(groups, "2");
    const withExtra = [...accounts, level("5", "Team", "Service")];

    expect(buildGroupsDestinationDistinguishedName(reordered, domainDn)).toBe(
      "OU=Operations,OU=Groups,DC=work,DC=com",
    );
    expect(buildGroupsDestinationDistinguishedName(withoutGroups, domainDn)).toBe(
      "OU=Operations,DC=work,DC=com",
    );
    expect(buildAccountsDestinationDistinguishedName(withExtra, domainDn)).toBe(
      "OU=Service,OU=Accounts,OU=Payroll,OU=Finance,OU=Operations,DC=work,DC=com",
    );
    expect(buildOrganisationalTargetDistinguishedName(organisational, domainDn)).toBe(
      "OU=Finance,OU=Operations,DC=work,DC=com",
    );
  });
});
