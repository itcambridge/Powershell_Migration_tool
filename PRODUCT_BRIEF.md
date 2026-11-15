# Product brief

Migration Command Builder replaces an Excel-based PowerShell command generator with a small web application. An engineer configures one migration run, reviews the generated commands, and copies or exports them. They run those commands themselves on the appropriate server.

The application does not call an AI service, connect to Active Directory, connect to file servers, or execute PowerShell.

## Who it is for

Infrastructure engineers preparing a migration for one domain at a time.

## Current behaviour

Each migration run is one domain:

- Domain identifier, distinguished name, and file server root.
- An ordered folder hierarchy of any depth, with an editable label and folder name on each level.
- An ordered organisational OU hierarchy of any depth, independent of the folder hierarchy.
- Separate groups and accounts destination OU hierarchies, also of any depth, and not derived from the organisational hierarchy.
- The resolved folder path and a distinguished name for each OU hierarchy.
- A group name, category, scope, and description. Category starts as `Security` and scope as `DomainLocal`.
- A group identity and member account, stored separately from the group being created.
- A demonstration directory-creation command, a `New-ADGroup` command, and an `Add-ADGroupMember` command.
- Copy one command, copy the full script, or export a `.ps1` file.
- Start a new run, which replaces the current configuration with the fictional example.

A second domain is a second run. Runs do not share folder or OU levels.

Example values shipped with a new run are fictional. They are not organisation naming rules.

## Out of scope

AI or LLM command generation, PowerShell execution, directory or server connectivity, databases, saved configurations, authentication, change-request automation, complex validation, infrastructure discovery, and automated dependency resolution.

Further command modules wait until their rules are specified and approved.
