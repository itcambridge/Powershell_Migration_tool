# Architecture

The app is a Next.js App Router application. One migration run stays in the browser. PowerShell text is produced by pure TypeScript functions.

```text
src/app                 Next.js routes and global styles
src/components          Presentation and output UI
src/application         Run creation, domain edits, and view coordination
src/domain              Configuration types and hierarchy rules
src/generation          PowerShell generators, independent of React
```

## Layers

**Presentation.** `MigrationWorkspace` holds the current run and renders the sidebar, domain form, hierarchy editors, and command preview. New run asks for confirmation, then replaces that state with `createMigrationRun()`. Hierarchy editors call domain helpers to add, remove, and reorder levels. They do not assemble PowerShell.

**Application.** `deriveMigration` turns one `MigrationConfig` into a folder path, three distinguished names, and the command set. The organisational, groups, and accounts names are calculated from their own level arrays. `updateDomain` edits the domain on that run. `createMigrationRun` copies the fictional example so runs do not share objects.

**Generation.** Each generator accepts a `MigrationConfig` and returns a `GeneratedCommand`. `generateMigrationCommands` is the registry. It currently registers the directory command, `New-ADGroup`, and `Add-ADGroupMember`. Generators import hierarchy builders from `src/domain` and do not import React.

**Output.** `CommandPreview` shows each script, copies one command or the full set, and downloads `migration-commands.ps1`. Copy-all and export both use `commandSet` from the application view, so they stay identical.

## Data flow

```text
createMigrationRun() -> MigrationConfig
  -> deriveMigration
       -> buildFolderPath
       -> organisational, groups, and accounts DN functions
       -> generateMigrationCommands
  -> MigrationView
  -> domain form, hierarchy previews, command panel
```

## Concerns

- Refreshing the page clears the run. There is no database and no browser storage. `MigrationConfig` is a plain object so a later phase can save and reload it.
- The domain distinguished name is appended as typed. It is not escaped, because its commas are part of the DN syntax. OU names are escaped.
- The directory generator is a demonstration. It must not be treated as an approved migration procedure.
- Initial level ids are fixed so server rendering and hydration match. Ids created after load come from `crypto.randomUUID`. A new run copies those fixed ids again.
