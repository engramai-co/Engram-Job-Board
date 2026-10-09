import { formatDate, parseLocalDate } from "../lib";
import type { DashboardView } from "../types";

export function DashboardHeader({ view, cycleOpened, lastReviewed }: { view: DashboardView; cycleOpened: string; lastReviewed: string }) {
  const copy = view === "applications"
    ? { title: "申请追踪", subtitle: "记录已提交的申请、沟通进展和下一步；待研究岗位单独展示。" }
    : { title: "岗位研究", subtitle: "先看工作内容是否合适，再确认资格、时间和合同条款。" };
  const dateOptions: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };

  return (
    <header className="memo-header">
      <div><h1>{copy.title}</h1><p>{copy.subtitle}</p></div>
      <div className="memo-meta"><span>本轮开始</span><strong>{formatDate(parseLocalDate(cycleOpened), dateOptions)}</strong></div>
      <div className="memo-meta"><span>最近核验</span><strong>{formatDate(parseLocalDate(lastReviewed), dateOptions)}</strong></div>
    </header>
  );
}
