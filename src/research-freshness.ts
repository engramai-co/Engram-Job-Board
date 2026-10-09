import type { JD } from "./types";

export type Freshness = { level: "recent" | "review" | "stale" | "unknown"; days: number | null; label: string; detail: string };
const dayMs = 86400000;
function calendarDay(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const stamp = Date.parse(value + "T00:00:00Z");
  return Number.isFinite(stamp) && new Date(stamp).toISOString().slice(0, 10) === value ? stamp : null;
}
export function londonDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
export function researchFreshness(jd: JD, today = londonDate()): Freshness {
  const checked = calendarDay(jd.checkedAt), current = calendarDay(today);
  if (!jd.url || jd.status === "Unchecked" || !["Browser", "Full text"].includes(jd.verification || "") || jd.match === "Unresolved" || checked === null || current === null || checked > current) {
    return { level: "unknown", days: null, label: "尚未核验", detail: "尚无有效的当前 JD 核验日期。原始链接、历史索引或一次失败的检查不能当作新核验；不会因此扣分或隐藏岗位。" };
  }
  const days = Math.floor((current - checked) / dayMs);
  if (days <= 14) return { level: "recent", days, label: "近期已核验", detail: `上次记录的有效核验为 ${jd.checkedAt}，距今 ${days} 天。` };
  if (days <= 30) return { level: "review", days, label: "建议复查", detail: `距上次有效核验 ${days} 天。建议重新检查原始 JD、招聘状态及条款；不扣分、不改变排序。` };
  return { level: "stale", days, label: "信息可能过期", detail: `距上次有效核验 ${days} 天，超过 30 天。需要复查，但不代表岗位已经关闭；不会自动隐藏或改变匹配分。` };
}
