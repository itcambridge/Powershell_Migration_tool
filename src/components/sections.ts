export const sectionClassName = "scroll-mt-40 lg:scroll-mt-8";

export const SECTIONS = [
  { id: "domain", label: "Domain", hint: "Identifier and root" },
  { id: "folders", label: "Folders", hint: "Directory hierarchy" },
  { id: "ous", label: "AD locations", hint: "Object destinations" },
  { id: "groups", label: "Groups", hint: "Group command" },
  { id: "membership", label: "Membership", hint: "Group member" },
  { id: "commands", label: "Commands", hint: "Preview and export" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];
