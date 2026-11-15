# Generation spec

Generators are pure functions. The same `MigrationConfig` always produces the same strings. They do not read the DOM, call a network service, or start a PowerShell process. They do not branch on a particular organisation name.

## Contract

```ts
interface GeneratedCommand {
  id: string;
  title: string;
  script: string;
}

function generateSomething(config: MigrationConfig): GeneratedCommand;
```

`generateMigrationCommands` calls each registered generator and returns the list in display order. `renderCommandSet` joins those scripts into the text used for copy-all and `.ps1` export.

The export file is UTF-8 without a BOM, named `migration-commands.ps1`. It starts with a short review header, then each command script separated by a blank line. Copying one command copies that script only, without the file header.

## Current generators

| Function | Id | Behaviour |
| --- | --- | --- |
| `generateDirectoryCommand` | `create-directory` | `New-Item` for this run's folder path |
| `generateGroupCommand` | `create-group` | `New-ADGroup` at the groups destination DN |
| `generateMembershipCommand` | `add-group-member` | `Add-ADGroupMember` for one group and one account |

The directory command is a demonstration. It reads the domain identifier, file server root, and folder levels from the run. OU changes do not affect it. Replace the function when an approved directory rule exists.

The group command reads `group` and `groupsOuLevels`. It does not read the organisational or accounts hierarchies. The membership command reads only `groupMembership`. Account creation and permission commands are not generated.

### New-ADGroup

When the name, category, groups destination DN, scope, and description are all present, the script ends with one command:

```text
New-ADGroup -Name "<name>" -GroupCategory <category> -Path "<groups DN>" -GroupScope <scope> -Description "<description>"
```

`-Name`, `-Path`, and `-Description` are PowerShell double-quoted strings. Inside them, a backtick is doubled, and `"`, `$`, carriage return, and line feed are escaped with a backtick. The groups DN is already LDAP-escaped before it is placed in that string, so a comma in an OU name stays a backslash-comma. `-GroupCategory` and `-GroupScope` are written only when the value is one of `Security`, `Distribution`, `DomainLocal`, `Global`, or `Universal` as appropriate. They are not quoted.

If any required value is missing, or the category or scope is not one of those values, the script is a comment only. The comment names each incomplete field. It does not contain `New-ADGroup`.

With the fictional example, the command is:

```text
New-ADGroup -Name "Example Readers" -GroupCategory Security -Path "OU=Groups,OU=Operations,DC=contoso,DC=example" -GroupScope DomainLocal -Description "Demonstration security group for this run."
```

### Add-ADGroupMember

When both the group identity and the member account are present after trimming, the script ends with:

```text
Add-ADGroupMember -Identity "<identity>" -Members "<member>"
```

Both values are PowerShell double-quoted strings, escaped the same way as the group command: a backtick is doubled, and `"`, `$`, carriage return, and line feed are escaped with a backtick. The identity is not taken from `group.name`.

If either value is missing or whitespace-only, the script is a comment only. The comment names each missing field. It does not contain `Add-ADGroupMember`.

With the fictional example, the command is:

```text
Add-ADGroupMember -Identity "Example Library" -Members "Example Reader"
```

## Template conventions

- A comment block states that the command is a demonstration and that the application does not run it.
- The path is placed in a PowerShell single-quoted string. A single quote in the path is written twice (`O'Brien` becomes `O''Brien`).
- The command is `New-Item -ItemType Directory -Path '<path>' -Force`.
- An empty or whitespace-only directory path does not emit `New-Item`. The comment states that the directory path has not been configured.
- Comment text neutralises a literal `#>` so a value cannot close the comment block early.
- An empty identifier is written as `Domain`.

OU name escaping, used by distinguished-name construction rather than by the directory command:

- `\ , + " < > ; =` are backslash-escaped.
- A leading `#` is backslash-escaped.
- Leading and trailing spaces are escaped as `\ `.
- The domain DN suffix is not escaped.

## Adding a generator

1. Add a function in `src/generation` that accepts `MigrationConfig` and returns `GeneratedCommand`.
2. Keep it free of React imports.
3. Register it in `generateMigrationCommands`.
4. Add a unit test that locks the script for a known configuration.
5. Update this document when the command stops being a demonstration.
