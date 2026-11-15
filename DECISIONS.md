# Decisions

## 2026-11-15 — Next.js client application, no backend

The repository was empty. Phase 1 uses the current Next.js App Router scaffold (React, TypeScript, Tailwind CSS) and keeps migration state in `useState`. A database, authentication, and server APIs are omitted because the engineer only needs to configure a migration and leave with a script.

## 2026-11-15 — One shared hierarchy of each kind

Superseded the same day by one domain per run. Phase 1 applied one folder list and one OU list to two domains inside a single configuration.

## 2026-11-15 — Hierarchies are arrays

`folderLevels` and `ouLevels` are ordered `{ id, label, name }` arrays. The UI adds and removes rows from those arrays. Five fixed properties would block an arbitrary depth.

## 2026-11-15 — Generation is a pure module

Command text is built in `src/generation` from `MigrationConfig`. The UI calls `deriveMigration` and renders the result. That keeps a future generator from depending on a component, and it keeps tests free of the DOM.

## 2026-11-15 — Demonstration directory commands only

The directory command is a demonstration `New-Item`. Organisation-specific cmdlets, names, and ordering are not guessed. The generator reads the current run and does not special-case an organisation name.

## 2026-11-15 — Escape OU values, append the domain DN raw

An OU name is a single RDN and is escaped. The domain distinguished name is typed by the engineer as a DN suffix (`DC=contoso,DC=example`), so its commas must remain structural. Blank hierarchy names are kept in the form and omitted from the path and DN.

## 2026-11-15 — Stable ids for the initial example

The default configuration uses fixed level ids. Random ids during the first render would make the server HTML differ from the client render. Levels added later use `crypto.randomUUID`.

## 2026-11-15 — Visual direction without a reference image

No reference image was present in the repository. The interface follows the written direction: dark green sidebar, light workspace, cards for the domain and hierarchies, and a distinct command preview. Incomplete wizard steps are not shown. Configuration, resolved paths, and the command preview are the working surface.

## 2026-11-15 — One domain per migration run

A run is one domain plus that run's folder levels and OU levels. The fixed two-domain tuple is removed. New run copies the fictional example into fresh objects, so the next domain starts clean. Saving a run is left for later: `MigrationConfig` stays a plain object, and this phase adds no database or browser storage.

## 2026-11-15 — Object destinations are separate hierarchies

Groups and accounts each have their own ordered OU list on the migration run. Those lists are not computed from the organisational hierarchy and are not assumed to sit beneath its bottom-level OU. Each distinguished name is built only from the levels passed to that function. The example values differ in depth so the independence is visible. They are not organisation naming rules.

## 2026-11-15 — New-ADGroup uses the groups destination

The first Active Directory command is `New-ADGroup`. Its `-Path` is the groups destination distinguished name already calculated for the run. The group name, category, scope, and description are a separate `group` object, so they are not inferred from OU names. Category defaults to `Security` and scope to `DomainLocal`; both stay configurable. A missing name, description, destination DN, or an unrecognised category or scope produces a comment instead of a command. The application still does not run PowerShell.

## 2026-11-15 — Group membership is a separate record

`Add-ADGroupMember` reads `groupMembership`, not the group created by `New-ADGroup`. One run holds one identity and one member. Either value missing or whitespace-only produces a comment and no cmdlet. Bulk membership is left for later.

## 2026-11-15 — Vitest on Node 22 types

Unit tests use Vitest. `@types/node` is aligned to Node 22, which matches the local runtime and the Vitest 5 peer range.
