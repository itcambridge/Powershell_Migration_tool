"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  createMigrationRun,
  deriveMigration,
  updateDomain,
  updateGroup,
  updateGroupMembership,
} from "@/application/migration";
import { CommandPreview } from "@/components/CommandPreview";
import { DomainConfigSection } from "@/components/DomainConfigSection";
import { GroupConfigSection } from "@/components/GroupConfigSection";
import { GroupMembershipSection } from "@/components/GroupMembershipSection";
import { HierarchyEditor } from "@/components/HierarchyEditor";
import { ResolvedList } from "@/components/ResolvedList";
import { Sidebar } from "@/components/Sidebar";
import { SECTIONS, sectionClassName, type SectionId } from "@/components/sections";
import type { HierarchyLevel } from "@/domain/types";

export function MigrationWorkspace() {
  const [config, setConfig] = useState(createMigrationRun);
  const [activeSection, setActiveSection] = useState<SectionId>("domain");
  const suppressObserverRef = useRef(false);
  const view = useMemo(() => deriveMigration(config), [config]);

  useEffect(() => {
    const elements = SECTIONS.map((section) => document.getElementById(section.id)).filter(
      (element): element is HTMLElement => element !== null,
    );
    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      () => {
        if (suppressObserverRef.current) {
          return;
        }

        const marker = window.innerHeight * 0.28;
        const positions = SECTIONS.flatMap((section) => {
          const element = document.getElementById(section.id);
          return element ? [{ id: section.id, top: element.getBoundingClientRect().top }] : [];
        });
        const nearestAbove = positions
          .filter((section) => section.top <= marker)
          .sort((left, right) => right.top - left.top);
        const nearestOverall = [...positions].sort((left, right) => left.top - right.top);
        const current = nearestAbove[0]?.id ?? nearestOverall[0]?.id;
        if (current) {
          setActiveSection(current);
        }
      },
      { rootMargin: "0px", threshold: [0, 0.25] },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  function navigate(sectionId: SectionId) {
    setActiveSection(sectionId);
    suppressObserverRef.current = true;
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      suppressObserverRef.current = false;
    }, 800);
  }

  function startNewRun() {
    const confirmed = window.confirm(
      "Start a new migration run? The current domain, folder levels, OU levels, group, and membership settings will be replaced with the example values.",
    );
    if (!confirmed) {
      return;
    }

    setConfig(createMigrationRun());
    setActiveSection("domain");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setFolderLevels(folderLevels: HierarchyLevel[]) {
    setConfig((current) => ({ ...current, folderLevels }));
  }

  function setOuLevels(ouLevels: HierarchyLevel[]) {
    setConfig((current) => ({ ...current, ouLevels }));
  }

  function setGroupsOuLevels(groupsOuLevels: HierarchyLevel[]) {
    setConfig((current) => ({ ...current, groupsOuLevels }));
  }

  function setAccountsOuLevels(accountsOuLevels: HierarchyLevel[]) {
    setConfig((current) => ({ ...current, accountsOuLevels }));
  }

  const bottomOuNote = view.bottomOuName
    ? `Bottom-level organisational OU: ${
        view.bottomOuLabel ? `${view.bottomOuLabel} — ` : ""
      }${view.bottomOuName}. Groups and accounts use their own destination hierarchies.`
    : "No organisational OU name yet. The distinguished name is only the domain suffix until an OU is entered.";

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <Sidebar activeSection={activeSection} onNavigate={navigate} onNewRun={startNewRun} />
      <main className="min-w-0 px-4 py-6 sm:px-8 lg:px-10 lg:py-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
          <header>
            <p className="text-sm font-medium text-accent">Migration run</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Migration structure</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              Configure this run&apos;s domain, folder hierarchy, OU locations, group, and
              membership. The path, distinguished names, and commands update as you type.
            </p>
          </header>

          <DomainConfigSection
            domain={config.domain}
            onChange={(patch) => setConfig((current) => updateDomain(current, patch))}
          />

          <HierarchyEditor
            id="folders"
            title="Folder hierarchy"
            description="Add as many folder levels as this run needs. Level 1 is the first folder under the file server root."
            nameLabel="Folder name"
            addLabel="Add folder level"
            emptyText="No folder levels. The path will be the file server root only."
            levels={config.folderLevels}
            onChange={setFolderLevels}
          >
            <ResolvedList
              title="Folder path"
              note="Built from this run's file server root plus the folder names, in level order."
              rows={[
                {
                  id: "folder-path",
                  label: view.label,
                  value: view.folderPath || "No path yet",
                },
              ]}
            />
          </HierarchyEditor>

          <section id="ous" className={sectionClassName}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold tracking-tight">AD Object Locations</h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
                Set a destination hierarchy for each object type. The lists are separate,
                so groups and accounts are not placed under the organisational OU unless
                you enter those levels yourself.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <HierarchyEditor
                title="Organisational OU hierarchy"
                description="Parent-to-child levels for the organisational location. Level 1 is the parent. The last named level is the organisational target OU."
                nameLabel="OU name"
                addLabel="Add organisational level"
                emptyText="No organisational OU levels. The distinguished name will be the domain DN only."
                levels={config.ouLevels}
                onChange={setOuLevels}
              >
                <ResolvedList
                  title="Organisational target distinguished name"
                  note={bottomOuNote}
                  rows={[
                    {
                      id: "organisational-ou",
                      label: view.label,
                      value:
                        view.organisationalTargetOuDistinguishedName ||
                        "No distinguished name yet",
                    },
                  ]}
                />
              </HierarchyEditor>
              <HierarchyEditor
                title="Groups destination hierarchy"
                description="Parent-to-child levels for the groups destination. This list is not derived from the organisational hierarchy."
                nameLabel="OU name"
                addLabel="Add groups level"
                emptyText="No groups destination levels. The distinguished name will be the domain DN only."
                levels={config.groupsOuLevels}
                onChange={setGroupsOuLevels}
              >
                <ResolvedList
                  title="Groups destination distinguished name"
                  note="Built only from the groups destination levels and the domain DN."
                  rows={[
                    {
                      id: "groups-ou",
                      label: view.label,
                      value:
                        view.groupsDestinationOuDistinguishedName ||
                        "No distinguished name yet",
                    },
                  ]}
                />
              </HierarchyEditor>
              <HierarchyEditor
                title="Accounts destination hierarchy"
                description="Parent-to-child levels for the accounts destination. This list is not derived from the organisational or groups hierarchies."
                nameLabel="OU name"
                addLabel="Add accounts level"
                emptyText="No accounts destination levels. The distinguished name will be the domain DN only."
                levels={config.accountsOuLevels}
                onChange={setAccountsOuLevels}
              >
                <ResolvedList
                  title="Accounts destination distinguished name"
                  note="Built only from the accounts destination levels and the domain DN."
                  rows={[
                    {
                      id: "accounts-ou",
                      label: view.label,
                      value:
                        view.accountsDestinationOuDistinguishedName ||
                        "No distinguished name yet",
                    },
                  ]}
                />
              </HierarchyEditor>
            </div>
          </section>

          <GroupConfigSection
            group={config.group}
            domainLabel={view.label}
            groupsDistinguishedName={view.groupsDestinationOuDistinguishedName}
            onChange={(patch) => setConfig((current) => updateGroup(current, patch))}
          />

          <GroupMembershipSection
            membership={config.groupMembership}
            onChange={(patch) => setConfig((current) => updateGroupMembership(current, patch))}
          />

          <CommandPreview
            domainLabel={view.label}
            folderPath={view.folderPath}
            commands={view.commands}
            commandSet={view.commandSet}
          />
        </div>
      </main>
    </div>
  );
}
