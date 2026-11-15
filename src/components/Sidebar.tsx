import { SECTIONS, type SectionId } from "@/components/sections";

interface SidebarProps {
  activeSection: SectionId;
  onNavigate: (sectionId: SectionId) => void;
  onNewRun: () => void;
}

export function Sidebar({ activeSection, onNavigate, onNewRun }: SidebarProps) {
  return (
    <aside className="sticky top-0 z-20 w-full bg-sidebar text-sidebar-ink lg:flex lg:h-screen lg:flex-col">
      <div className="flex items-start justify-between gap-3 px-5 py-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sidebar-muted">
            Migration
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight">Command Builder</p>
        </div>
        <button
          type="button"
          onClick={onNewRun}
          className="mt-1 shrink-0 rounded-md border border-white/25 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10"
        >
          New run
        </button>
      </div>
      <nav aria-label="Sections" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:flex-1 lg:space-y-1 lg:overflow-visible lg:px-3">
        {SECTIONS.map((section) => {
          const active = section.id === activeSection;

          return (
            <button
              key={section.id}
              type="button"
              aria-current={active ? "true" : undefined}
              onClick={() => onNavigate(section.id)}
              className={`shrink-0 rounded-md px-3 py-2 text-left lg:block lg:w-full lg:shrink lg:border-l-2 ${
                active
                  ? "bg-sidebar-active text-white lg:border-accent"
                  : "text-sidebar-muted hover:bg-white/5 hover:text-white lg:border-transparent"
              }`}
            >
              <span className="block text-sm font-medium">{section.label}</span>
              <span className="mt-0.5 hidden text-xs text-sidebar-muted lg:block">{section.hint}</span>
            </button>
          );
        })}
      </nav>
      <p className="hidden px-5 py-6 text-xs leading-5 text-sidebar-muted lg:block">
        Commands are generated for review and manual execution. This application does
        not connect to servers or run PowerShell.
      </p>
    </aside>
  );
}
