import type { DashboardView } from "../types";

interface SidebarProps {
  view: DashboardView;
  cycle: string;
  activeCount: number;
  offerCount: number;
  onChange: (view: DashboardView) => void;
}

function PortfolioIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v9h9A9 9 0 1 1 12 3Z"/><path d="M15 3.6A9 9 0 0 1 20.4 9H15Z"/></svg>;
}

function ResearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14v12H5z"/><path d="M9 7V4h6v3M5 11h14M10 11v2h4v-2"/></svg>;
}

export function Sidebar({ view, cycle, activeCount, offerCount, onChange }: SidebarProps) {
  return (
    <aside className="folio-rail" aria-label="Dashboard navigation">
      <a className="identity" href="#applications" onClick={(event) => { event.preventDefault(); onChange("applications"); }} aria-label="Application tracker">
        <svg className="identity-mark" viewBox="0 0 40 40" aria-hidden="true">
          <path d="M4 6h24l8 8v20H4z" />
          <path d="M28 6v8h8M11 17h17M11 23h12M11 29h15" />
        </svg>
        <span><strong>Engram-Job-Board</strong><small>Research to application</small></span>
      </a>

      <nav className="rail-nav" aria-label="Dashboard views">
        <a className={`rail-link${view === "applications" ? " is-active" : ""}`} href="#applications" aria-current={view === "applications" ? "page" : undefined} onClick={(event) => { event.preventDefault(); onChange("applications"); }}>
          <PortfolioIcon /><span>Application tracker</span>
        </a>
        <a className={`rail-link${view === "research" ? " is-active" : ""}`} href="#research" aria-current={view === "research" ? "page" : undefined} onClick={(event) => { event.preventDefault(); onChange("research"); }}>
          <ResearchIcon /><span>Research</span>
        </a>
      </nav>

      <div className="rail-summary" aria-label="Search cycle summary">
        <p>Search cycle</p>
        <strong>{cycle}</strong>
        <dl>
          <div><dt>Active</dt><dd>{activeCount}</dd></div>
          <div><dt>Offers</dt><dd>{offerCount}</dd></div>
        </dl>
      </div>

      <div className="rail-footer"><span className="live-dot" aria-hidden="true"/><span>Read-only · code maintained</span></div>
    </aside>
  );
}
