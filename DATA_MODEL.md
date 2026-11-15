# Data model

A migration run is an in-memory object. Hierarchies are ordered arrays, not a fixed set of fields such as level1 through level5.

## MigrationConfig

| Field | Type | Meaning |
| --- | --- | --- |
| `domain` | `DomainConfig` | The single domain for this run |
| `folderLevels` | `HierarchyLevel[]` | Parent-to-child folder order |
| `ouLevels` | `HierarchyLevel[]` | Parent-to-child organisational OU order |
| `groupsOuLevels` | `HierarchyLevel[]` | Parent-to-child groups destination |
| `accountsOuLevels` | `HierarchyLevel[]` | Parent-to-child accounts destination |
| `group` | `GroupConfig` | Name, category, scope, and description for the group command |
| `groupMembership` | `GroupMembershipConfig` | Group identity and member account for `Add-ADGroupMember` |

### DomainConfig

| Field | Meaning |
| --- | --- |
| `identifier` | Short name shown in the preview and command comment |
| `distinguishedName` | Domain DN suffix, for example `DC=contoso,DC=example` |
| `fileServerRoot` | UNC or other root prepended to the folder hierarchy |

### HierarchyLevel

| Field | Meaning |
| --- | --- |
| `id` | Stable row id |
| `label` | Editable caption, such as Region or Division |
| `name` | Folder name or OU name entered for that level |

### GroupConfig

| Field | Meaning |
| --- | --- |
| `name` | `-Name` on `New-ADGroup` |
| `category` | `-GroupCategory`. The example uses `Security`. `Distribution` is the other accepted value |
| `scope` | `-GroupScope`. The example uses `DomainLocal`. `Global` and `Universal` are also accepted |
| `description` | `-Description` |

The group record does not choose an OU. `-Path` is the calculated groups destination distinguished name. Category and scope are Active Directory enumerations, not organisation names.

### GroupMembershipConfig

| Field | Meaning |
| --- | --- |
| `identity` | `-Identity` on `Add-ADGroupMember` |
| `member` | `-Members` on `Add-ADGroupMember` |

This record is not copied from `group.name`. A run can create one group and add an account to a different group. One membership record is stored per run.

Folder depth and each OU hierarchy depth are unrelated. Any list may be empty. The groups and accounts lists are not appended to, or copied from, the organisational list. Another domain is another run, with its own copy of every list.

## Derived values

These are calculated. They are not stored on the configuration.

**Folder path.** Trim the file server root and remove trailing `\` or `/`. Trim each folder name, drop blank names, and join the remainder with `\`.

`\\fs01\deptshares` + North, Manchester, Finance becomes:

```text
\\fs01\deptshares\North\Manchester\Finance
```

**Distinguished names.** Each OU hierarchy is walked from the bottom upward on its own. Blank names are skipped. Each remaining name is escaped as an RDN value and prefixed with `OU=`. The trimmed domain DN is appended without escaping. An empty hierarchy produces the domain DN only.

With `DC=contoso,DC=example`, the fictional example resolves to:

```text
Organisational: OU=Payroll,OU=Finance,OU=Operations,DC=contoso,DC=example
Groups:         OU=Groups,OU=Operations,DC=contoso,DC=example
Accounts:       OU=Accounts,OU=Payroll,OU=Finance,OU=Operations,DC=contoso,DC=example
```

**Bottom-level organisational OU.** The last organisational level whose name is not blank. Groups and accounts use their own full distinguished names. The application does not manage the rest of the directory tree.

## Fictional example

A new run starts from this example:

| Field | Value |
| --- | --- |
| Identifier | CONTOSO |
| Distinguished name | `DC=contoso,DC=example` |
| File server root | `\\fs01\deptshares` |

Folders: Region/North, Site/Manchester, Team/Finance.

Organisational OUs: Division/Operations, Department/Finance, Team/Payroll.

Groups destination: Division/Operations, Container/Groups.

Accounts destination: Division/Operations, Department/Finance, Team/Payroll, Container/Accounts.

Group: name `Example Readers`, category `Security`, scope `DomainLocal`, description `Demonstration security group for this run.`

Group membership: identity `Example Library`, member `Example Reader`. These differ from the created group name on purpose.

These three lists differ on purpose. They are example data, not a rule that groups or accounts sit under the organisational OU.

`createMigrationRun` copies these values. Editing one run does not change the example or any other run.

## Editing rules

- Adding a level appends it.
- Removing a level deletes that id and closes the gap.
- Moving a level swaps it with the neighbour and does not renumber stored ids.
- Blank names stay in the editor so the engineer can fill them in, and they are omitted from the path and the DN.
- New run replaces the whole configuration with a fresh example copy.

## Later persistence

`MigrationConfig` contains only strings and arrays of plain objects. A future save and reload feature can serialise that object. This phase does not write it to a database, a file, or browser storage.
