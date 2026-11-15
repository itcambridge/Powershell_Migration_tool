import type { ReactNode } from "react";
import { sectionClassName } from "@/components/sections";
import { TextField } from "@/components/TextField";
import {
  createHierarchyLevel,
  moveLevel,
  removeLevel,
  updateLevel,
} from "@/domain/hierarchy";
import type { HierarchyLevel } from "@/domain/types";

interface HierarchyEditorProps {
  id?: string;
  title: string;
  description: string;
  nameLabel: string;
  addLabel: string;
  emptyText: string;
  levels: readonly HierarchyLevel[];
  onChange: (levels: HierarchyLevel[]) => void;
  children?: ReactNode;
}

function levelName(level: HierarchyLevel, index: number): string {
  const label = level.label.trim();
  return label.length > 0 ? label : `level ${index + 1}`;
}

export function HierarchyEditor({
  id,
  title,
  description,
  nameLabel,
  addLabel,
  emptyText,
  levels,
  onChange,
  children,
}: HierarchyEditorProps) {
  const TitleTag = id ? "h2" : "h3";
  const card = (
      <div className="rounded-xl border border-line bg-card p-5 shadow-sm">
        <TitleTag className="text-lg font-semibold tracking-tight">{title}</TitleTag>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">{description}</p>

        {levels.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-line px-4 py-6 text-sm text-muted">
            {emptyText}
          </p>
        ) : (
          <ol className="mt-4 space-y-3">
            {levels.map((level, index) => {
              const name = levelName(level, index);

              return (
                <li key={level.id} className="rounded-lg border border-line px-3 py-3">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent-soft text-accent">
                        {index + 1}
                      </span>
                      Level {index + 1}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        aria-label={`Move ${name} up`}
                        disabled={index === 0}
                        onClick={() => onChange(moveLevel(levels, level.id, -1))}
                        className="rounded-md px-2 py-1 text-sm font-medium text-ink hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        aria-label={`Move ${name} down`}
                        disabled={index === levels.length - 1}
                        onClick={() => onChange(moveLevel(levels, level.id, 1))}
                        className="rounded-md px-2 py-1 text-sm font-medium text-ink hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        aria-label={`Remove ${name}`}
                        onClick={() => onChange(removeLevel(levels, level.id))}
                        className="rounded-md px-2 py-1 text-sm font-medium text-muted hover:bg-red-50 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextField
                      id={`${level.id}-label`}
                      label="Label"
                      value={level.label}
                      onChange={(label) => onChange(updateLevel(levels, level.id, { label }))}
                    />
                    <TextField
                      id={`${level.id}-name`}
                      label={nameLabel}
                      value={level.name}
                      mono
                      onChange={(nextName) =>
                        onChange(updateLevel(levels, level.id, { name: nextName }))
                      }
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        <button
          type="button"
          onClick={() =>
            onChange([...levels, createHierarchyLevel(`Level ${levels.length + 1}`)])
          }
          className="mt-4 rounded-md border border-accent px-3 py-2 text-sm font-medium text-accent hover:bg-accent-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {addLabel}
        </button>

        {children}
      </div>
  );

  if (!id) {
    return card;
  }

  return (
    <section id={id} className={sectionClassName}>
      {card}
    </section>
  );
}
