import { describe, expect, it } from "vitest";
import {
  bottomLevel,
  buildDistinguishedName,
  buildFolderPath,
  escapeDistinguishedNameValue,
  moveLevel,
  removeLevel,
  updateLevel,
} from "@/domain/hierarchy";
import type { HierarchyLevel } from "@/domain/types";

function level(id: string, label: string, name: string): HierarchyLevel {
  return { id, label, name };
}

describe("buildFolderPath", () => {
  it("joins the root and folder names in level order", () => {
    const path = buildFolderPath("\\\\fs01\\deptshares", [
      level("1", "Region", "North"),
      level("2", "Site", "Manchester"),
      level("3", "Team", "Finance"),
    ]);

    expect(path).toBe("\\\\fs01\\deptshares\\North\\Manchester\\Finance");
  });

  it("keeps a UNC prefix and drops a trailing separator on the root", () => {
    const path = buildFolderPath("\\\\fs01\\deptshares\\", [
      level("1", "Region", "North"),
    ]);

    expect(path).toBe("\\\\fs01\\deptshares\\North");
  });

  it("omits blank folder names without changing the order of the rest", () => {
    const path = buildFolderPath("\\\\fs01\\deptshares", [
      level("1", "Region", "North"),
      level("2", "Site", "   "),
      level("3", "Team", "Finance"),
    ]);

    expect(path).toBe("\\\\fs01\\deptshares\\North\\Finance");
  });

  it("returns the root when every folder name is blank", () => {
    expect(buildFolderPath("\\\\fs01\\deptshares", [level("1", "Region", "")])).toBe(
      "\\\\fs01\\deptshares",
    );
  });

  it("returns an empty string when the root and names are empty", () => {
    expect(buildFolderPath("  ", [])).toBe("");
  });
});

describe("buildDistinguishedName", () => {
  it("places the bottom-level OU first and appends the domain DN raw", () => {
    const dn = buildDistinguishedName(
      [
        level("1", "Division", "Operations"),
        level("2", "Department", "Finance"),
      ],
      "DC=contoso,DC=example",
    );

    expect(dn).toBe("OU=Finance,OU=Operations,DC=contoso,DC=example");
  });

  it("escapes special characters in OU names only", () => {
    expect(escapeDistinguishedNameValue("Finance, UK")).toBe("Finance\\, UK");
    expect(escapeDistinguishedNameValue("Ops\\Team")).toBe("Ops\\\\Team");
    expect(escapeDistinguishedNameValue("#Finance")).toBe("\\#Finance");
    expect(escapeDistinguishedNameValue(" Finance ")).toBe("\\ Finance\\ ");

    const dn = buildDistinguishedName(
      [level("1", "Department", "Finance, UK")],
      "DC=contoso,DC=example",
    );

    expect(dn).toBe("OU=Finance\\, UK,DC=contoso,DC=example");
  });

  it("omits blank OU names and an empty domain suffix", () => {
    const dn = buildDistinguishedName(
      [level("1", "Division", "Operations"), level("2", "Department", " ")],
      "   ",
    );

    expect(dn).toBe("OU=Operations");
  });

  it("uses the last non-blank level as the bottom-level target", () => {
    const levels = [
      level("1", "Division", "Operations"),
      level("2", "Department", "Finance"),
      level("3", "Team", "  "),
    ];

    expect(bottomLevel(levels)?.name).toBe("Finance");
    expect(buildDistinguishedName(levels, "DC=fabrikam,DC=example")).toBe(
      "OU=Finance,OU=Operations,DC=fabrikam,DC=example",
    );
  });
});

describe("hierarchy editing", () => {
  const levels = [
    level("a", "Region", "North"),
    level("b", "Site", "Manchester"),
    level("c", "Team", "Finance"),
  ];

  it("updates, removes, and reorders levels without disturbing the others", () => {
    expect(updateLevel(levels, "b", { name: "Leeds" }).map((item) => item.name)).toEqual([
      "North",
      "Leeds",
      "Finance",
    ]);
    expect(removeLevel(levels, "b").map((item) => item.id)).toEqual(["a", "c"]);
    expect(moveLevel(levels, "c", -1).map((item) => item.id)).toEqual(["a", "c", "b"]);
    expect(moveLevel(levels, "a", -1).map((item) => item.id)).toEqual(["a", "b", "c"]);
  });
});
