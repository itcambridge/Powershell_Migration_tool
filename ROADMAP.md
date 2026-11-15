# Roadmap

## Phase 1 — Application foundation (done)

- Configurable domain details.
- Independent folder and OU hierarchies of any depth.
- Resolved path and target distinguished name.
- Demonstration directory command.
- Copy and `.ps1` export.
- Unit tests for hierarchy construction, distinguished names, and directory generation.

Phase 1 first modelled two domains in one configuration. That shape was replaced in Phase 2.

## Phase 2 — Single-domain runs (done)

- One domain, one folder hierarchy, and one OU hierarchy per run.
- New run resets to an independent copy of the fictional example.
- Generation follows the values on that run, with no built-in organisation names.

## Phase 3 — AD object locations (done)

- Organisational, groups, and accounts OU hierarchies on the same run.
- Each hierarchy has its own depth, names, order, and distinguished name.

## Phase 4 — New-ADGroup (done)

- Configurable group name, category, scope, and description.
- `New-ADGroup` uses the groups destination distinguished name as `-Path`.
- Incomplete group configuration is explained in a comment and does not emit the cmdlet.

## Phase 5 — Add-ADGroupMember (current)

- One group identity and one member account per run, stored separately from the group being created.
- `Add-ADGroupMember` is included in the preview, copy-all, and `.ps1` export.
- Account creation and bulk membership are not included.

## Later — Save and reload

Engineers may want to save a run and open it again. The configuration is already a plain object that can be serialised. That work is not started. It does not assume a database.
