import type { DashboardView } from "../types";

interface SidebarProps {
  view: DashboardView;
  name: string;
  cycle: string;
  activeCount: number | string;
  offerCount: number | string;
  onChange: (view: DashboardView) => void;
}

function PortfolioIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v9h9A9 9 0 1 1 12 3Z"/><path d="M15 3.6A9 9 0 0 1 20.4 9H15Z"/></svg>;
}

function ResearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14v12H5z"/><path d="M9 7V4h6v3M5 11h14M10 11v2h4v-2"/></svg>;
}

export function Sidebar({ view, name, cycle, activeCount, offerCount, onChange }: SidebarProps) {
  return (
    <aside className="folio-rail" aria-label="看板导航">
      <a className="identity" href="#applications" onClick={(event) => { event.preventDefault(); onChange("applications"); }} aria-label="申请追踪">
        <svg className="identity-mark" viewBox="0 0 40 40" aria-hidden="true">
          <path d="M4 6h24l8 8v20H4z" />
          <path d="M28 6v8h8M11 17h17M11 23h12M11 29h15" />
        </svg>
        <span><strong>{name} 的求职看板</strong><small>研究与申请 · 同一份记录</small></span>
      </a>

      <nav className="rail-nav" aria-label="看板页面">
        <a className={`rail-link${view === "applications" ? " is-active" : ""}`} href="#applications" aria-current={view === "applications" ? "page" : undefined} onClick={(event) => { event.preventDefault(); onChange("applications"); }}>
          <PortfolioIcon /><span>申请追踪</span>
        </a>
        <a className={`rail-link${view === "research" ? " is-active" : ""}`} href="#research" aria-current={view === "research" ? "page" : undefined} onClick={(event) => { event.preventDefault(); onChange("research"); }}>
          <ResearchIcon /><span>岗位研究</span>
        </a>
      </nav>

      <div className="rail-summary" aria-label="本轮求职概况">
        <p>求职周期</p>
        <strong>{cycle}</strong>
        <dl>
          <div><dt>进行中</dt><dd>{activeCount}</dd></div>
          <div><dt>Offer</dt><dd>{offerCount}</dd></div>
        </dl>
      </div>

      <div className="rail-footer"><span className="live-dot" aria-hidden="true"/><span>研究与申请 · 本机联动</span></div>
    </aside>
  );
}
