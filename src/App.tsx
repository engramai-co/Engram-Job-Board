import { Component, type ErrorInfo, type ReactNode, useEffect, useState } from "react";
import { DashboardHeader } from "./components/DashboardHeader";
import { Sidebar } from "./components/Sidebar";
import { isDemoData } from "./data/opportunities";
import { data, getPortfolioItems } from "./lib";
import type { DashboardView } from "./types";
import { ApplicationTracker } from "./views/ApplicationTracker";
import { Research } from "./views/Research";

function viewFromHash(): DashboardView {
  return window.location.hash === "#research" ? "research" : "applications";
}

class DashboardErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Dashboard render failed", error, info);
  }

  render() {
    if (this.state.failed) {
      return <main className="fatal-state"><div><h1>The dashboard could not render</h1><p>Reload the page. If the problem remains, run <code>pnpm typecheck</code> and inspect the data module.</p><button type="button" onClick={() => window.location.reload()}>Reload dashboard</button></div></main>;
    }
    return this.props.children;
  }
}

export function App() {
  const [view, setView] = useState<DashboardView>(viewFromHash);
  const portfolio = getPortfolioItems();
  const activeCount = portfolio.filter((item) => item.stage !== "Offer").length;
  const offerCount = portfolio.filter((item) => item.stage === "Offer").length;

  useEffect(() => {
    const handleHistory = () => setView(viewFromHash());
    window.addEventListener("popstate", handleHistory);
    window.addEventListener("hashchange", handleHistory);
    return () => {
      window.removeEventListener("popstate", handleHistory);
      window.removeEventListener("hashchange", handleHistory);
    };
  }, []);

  useEffect(() => {
    document.title = `Engram-Job-Board · ${view === "applications" ? "Application tracker" : "Research"} — ${data.profile.name}`;
    const canonicalHash = `#${view}`;
    if (window.location.hash !== canonicalHash) window.history.replaceState({ dashboardView: view }, "", canonicalHash);
  }, [view]);

  const selectView = (next: DashboardView) => {
    if (next === view) return;
    window.history.pushState({ dashboardView: next }, "", `#${next}`);
    setView(next);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  return (
    <DashboardErrorBoundary>
      <a className="skip-link" href="#main-content" onClick={(event) => {
        event.preventDefault();
        const main = document.getElementById("main-content");
        main?.focus();
        main?.scrollIntoView();
      }}>Skip to dashboard</a>
      <div className="app-shell">
        <Sidebar view={view} cycle={data.profile.cycle} activeCount={activeCount} offerCount={offerCount} onChange={selectView} />
        <main className="memo" id="main-content" tabIndex={-1}>
          <DashboardHeader view={view} cycleOpened={data.profile.cycleOpened} lastReviewed={data.research.lastReviewed} />
          <div className="data-mode-banner" role="note"><strong>{isDemoData ? "Fictional demonstration" : "Local data"}</strong><span>{isDemoData ? "All companies, applications, offer terms, and research decisions below are synthetic examples—not real opportunities or recommendations. No JDs have been verified." : "Code-maintained personal workspace. Data is bundled into any local build; do not publish that build."}</span></div>
          {view === "applications" ? <ApplicationTracker /> : <Research />}
          <footer className="memo-footer"><p>Data source: <code>{isDemoData ? "src/data/demo.ts" : "src/data/opportunities.local.ts"}</code></p><p>{isDemoData ? "Demo fixtures carry no evidence or verification claims." : "Keep exact JD evidence, compensation sources, and uncertainty explicit."}</p></footer>
        </main>
      </div>
    </DashboardErrorBoundary>
  );
}
