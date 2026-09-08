import { formatDate, parseLocalDate } from "../lib";
import type { DashboardView } from "../types";

export function DashboardHeader({ view, cycleOpened, lastReviewed }: { view: DashboardView; cycleOpened: string; lastReviewed: string }) {
  const copy = view === "applications"
    ? { title: "Application tracker", subtitle: "Submitted roles, current processes, and your optional offer baseline." }
    : { title: "Research", subtitle: "Exact-JD diligence for roles that have not entered the application portfolio." };
  const dateOptions: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };

  return (
    <header className="memo-header">
      <div><h1>{copy.title}</h1><p>{copy.subtitle}</p></div>
      <div className="memo-meta"><span>Cycle opened</span><strong>{formatDate(parseLocalDate(cycleOpened), dateOptions)}</strong></div>
      <div className="memo-meta"><span>Last reviewed</span><strong>{formatDate(parseLocalDate(lastReviewed), dateOptions)}</strong></div>
    </header>
  );
}
