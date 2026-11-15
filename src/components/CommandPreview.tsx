"use client";

import { useEffect, useRef, useState } from "react";
import { sectionClassName } from "@/components/sections";
import type { GeneratedCommand } from "@/generation";

interface CommandPreviewProps {
  domainLabel: string;
  folderPath: string;
  commands: readonly GeneratedCommand[];
  commandSet: string;
}

type CopyStatus = { key: string; state: "copied" | "failed" } | null;

const EXPORT_FILE_NAME = "migration-commands.ps1";

function exportCommandSet(contents: string) {
  const blob = new Blob([contents], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = EXPORT_FILE_NAME;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function CommandPreview({
  domainLabel,
  folderPath,
  commands,
  commandSet,
}: CommandPreviewProps) {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function showStatus(next: CopyStatus) {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    setCopyStatus(next);
    if (!next) {
      return;
    }

    timeoutRef.current = window.setTimeout(() => {
      setCopyStatus((current) => (current?.key === next.key ? null : current));
    }, 2000);
  }

  async function copyText(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      showStatus({ key, state: "copied" });
    } catch {
      showStatus({ key, state: "failed" });
    }
  }

  function buttonLabel(key: string, idle: string): string {
    if (copyStatus?.key !== key) {
      return idle;
    }

    return copyStatus.state === "copied" ? "Copied" : "Copy failed";
  }

  const statusMessage =
    copyStatus?.state === "copied"
      ? "Copied to the clipboard."
      : copyStatus?.state === "failed"
        ? "Copy failed."
        : "";

  return (
    <section id="commands" className={sectionClassName}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Command preview</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
            Directory, group, and membership commands for this run. Copy or export them,
            then review and run them on the appropriate server.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void copyText("all", commandSet)}
            className="rounded-md border border-line bg-white px-3 py-2 text-sm font-medium text-ink hover:border-accent hover:bg-accent-soft"
          >
            {buttonLabel("all", "Copy all")}
          </button>
          <button
            type="button"
            onClick={() => exportCommandSet(commandSet)}
            className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-[#176844]"
          >
            Export .ps1
          </button>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {statusMessage}
      </p>
      <div className="space-y-4">
        {commands.map((command) => {
          return (
            <article key={command.id} className="overflow-hidden rounded-xl border border-line bg-card shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent">
                    {domainLabel}
                  </p>
                  <h3 className="mt-1 text-base font-semibold">{command.title}</h3>
                  <p className="mt-1 break-all font-mono text-xs text-muted">
                    {folderPath || "No directory path yet"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void copyText(command.id, command.script)}
                  className="rounded-md border border-line bg-white px-3 py-2 text-sm font-medium text-ink hover:border-accent hover:bg-accent-soft"
                >
                  {buttonLabel(command.id, "Copy")}
                </button>
              </div>
              <pre className="overflow-x-auto bg-code px-5 py-4 font-mono text-xs leading-5 text-code-ink">
                {command.script}
              </pre>
            </article>
          );
        })}
      </div>
    </section>
  );
}
