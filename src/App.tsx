import { Component, type ErrorInfo, type ReactNode, useEffect, useState } from "react";
import { DashboardHeader } from "./components/DashboardHeader";
import { Sidebar } from "./components/Sidebar";
import { CareerBrief } from "./components/CareerBrief";
import { data, getPortfolioItems } from "./lib";
import type { DashboardView, TrackFilter } from "./types";
import { ApplicationTracker } from "./views/ApplicationTracker";
import { Research } from "./views/Research";
import { ProgressProvider, useProgress } from "./ProgressContext";
import { WorkspaceEditors } from "./components/WorkspaceEditors";
import { Alert, Button, Notification } from '@mantine/core';
import { Check, AlertCircle } from 'lucide-react';
import { WorkspaceBackup } from "./components/WorkspaceBackup";
import { isDemoData } from "./data/opportunities";

function viewFromHash(): DashboardView {
  return window.location.hash.startsWith("#research") ? "research" : "applications";
}

function focusedJobFromHash() {
  return new URLSearchParams(window.location.hash.split("?")[1] || "").get("job");
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
      return <main className="fatal-state"><div><h1>看板暂时无法显示</h1><p>请先刷新页面；如果仍然无法显示，请联系维护者检查最近的更新。</p><button type="button" onClick={() => window.location.reload()}>刷新看板</button></div></main>;
    }
    return this.props.children;
  }
}

export function App() {
  return <DashboardErrorBoundary><ProgressProvider><WorkspaceEditors><DashboardContent /></WorkspaceEditors></ProgressProvider></DashboardErrorBoundary>;
}

function DashboardContent() {
  const [view, setView] = useState<DashboardView>(viewFromHash);
  const [focusedJob, setFocusedJob] = useState<string | null>(focusedJobFromHash);
  const [track, setTrack] = useState<TrackFilter>("all");
  const progress = useProgress();
  const portfolio = getPortfolioItems(progress.opportunities);
  const activeCount = portfolio.filter((item) => !["Offer", "Rejected", "Withdrawn"].includes(item.stage)).length;
  const offerCount = portfolio.filter((item) => item.stage === "Offer").length;
  useEffect(() => {
    if (!progress.notice) return;
    const timer = window.setTimeout(progress.dismissNotice, 4500);
    return () => window.clearTimeout(timer);
  }, [progress.notice]);

  useEffect(() => {
    const handleHistory = () => { setView(viewFromHash()); setFocusedJob(focusedJobFromHash()); };
    window.addEventListener("popstate", handleHistory);
    window.addEventListener("hashchange", handleHistory);
    return () => {
      window.removeEventListener("popstate", handleHistory);
      window.removeEventListener("hashchange", handleHistory);
    };
  }, []);

  useEffect(() => {
    document.title = `${data.profile.name} · ${view === "applications" ? "申请追踪" : "岗位研究"} — Engram-Job-Board`;
  }, [view]);

  const selectView = (next: DashboardView) => {
    window.history.pushState({ dashboardView: next }, "", `#${next}`);
    setView(next);
    setFocusedJob(null);
    window.scrollTo({ top: 0, behavior: "auto" });
  };
  const showResearch = (id: string) => {
    setTrack("all");
    setFocusedJob(id);
    setView("research");
    window.history.pushState({}, "", "#research?job=" + encodeURIComponent(id));
  };

  return (
    <DashboardErrorBoundary>
      <a className="skip-link" href="#main-content" onClick={(event) => {
        event.preventDefault();
        const main = document.getElementById("main-content");
        main?.focus();
        main?.scrollIntoView();
      }}>跳转到看板正文</a>
      <div className={`app-shell app-shell--${view}`}>
        <Sidebar view={view} name={data.profile.name} cycle={data.profile.cycle} activeCount={progress.ready ? activeCount : "—"} offerCount={progress.ready ? offerCount : "—"} onChange={selectView} />
        <main className="memo" id="main-content" tabIndex={-1}>
          <DashboardHeader view={view} cycleOpened={data.profile.cycleOpened} lastReviewed={data.research.lastReviewed} />
          {isDemoData && <Alert color="forest" mb="lg" title="虚构示例工作区">公司、评分和申请均为演示数据。你在这里的修改只保存在当前浏览器，与本地私人数据工作区隔离。</Alert>}
          <details className="research-profile"><summary>{data.profile.name} 的求职偏好与入职时间筛选{track !== "all" && " · 已筛选时间"}</summary><CareerBrief track={track} onTrackChange={setTrack} /></details>
          {view === "applications" ? <ApplicationTracker key={track} track={track} onShowResearch={showResearch} /> : <Research key={track + (focusedJob || "")} track={track} focusedJob={focusedJob} onShowApplications={() => selectView("applications")} />}
          <footer className="memo-footer"><div><p>Engram-Job-Board · 本机工作区</p><p>记录保存在当前浏览器，不会上传或自动投递；清除浏览器数据会丢失编辑。请定期导出备份。</p><WorkspaceBackup/></div></footer>
        </main>
      </div>
      {progress.error ? <Alert className="ui-feedback" color="red" icon={<AlertCircle size={18}/>} title="同步需要处理" role="alert">
        {progress.error}
        <Button variant="light" color="red" mt="sm" loading={progress.loading} onClick={() => void progress.refresh()}>重新读取本机记录</Button>
      </Alert> : progress.notice && <Notification className="ui-feedback" icon={<Check size={16}/>} onClose={progress.dismissNotice} title="已保存" closeButtonProps={{'aria-label':'关闭保存提示'}} role="status">{progress.notice.text}{view === "research" && <Button variant="subtle" size="compact-xs" ml="sm" onClick={() => selectView("applications")}>查看申请追踪</Button>}</Notification>}
    </DashboardErrorBoundary>
  );
}
