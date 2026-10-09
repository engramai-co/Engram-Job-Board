import { contracts, eventResults, results, stages, validDate, type Entry, type EntryKind, type JobFields, type ScheduleFields } from "./tracker-model.ts";

export interface WorkspaceSnapshot { version: 1; workspace: string; entries: Entry[] }
export interface StoragePort { getItem(key: string): string | null; setItem(key: string, value: string): void }
const text = (value: unknown, max = 2000): value is string => typeof value === "string" && value.length <= max;
const optionalDate = (value: unknown) => value === "" || validDate(value);
function safeUrl(value: unknown) {
  if (value === "") return true;
  try { return text(value, 2000) && ["https:", "http:"].includes(new URL(value).protocol); } catch { return false; }
}
export function validPayload(kind: EntryKind, value: unknown): value is JobFields | ScheduleFields {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const p = value as Record<string, unknown>;
  if (kind === "job") return text(p.company, 200) && !!p.company.trim() && text(p.role, 300) && !!p.role.trim()
    && safeUrl(p.url) && text(p.location, 300) && text(p.category, 200) && text(p.industry, 200)
    && (p.contract === "" || contracts.includes(p.contract as never)) && stages.includes(p.stage as never)
    && optionalDate(p.appliedDate) && optionalDate(p.followUp) && optionalDate(p.deadline)
    && text(p.notes, 10000) && text(p.nextStep, 3000) && text(p.contact, 500);
  let zone = false;
  try { if (text(p.timeZone, 100)) { new Intl.DateTimeFormat("en", { timeZone: p.timeZone }); zone = true; } } catch { /* Reject invalid time zones. */ }
  return ["interview", "event"].includes(kind) && text(p.jobId, 150) && (kind !== "interview" || !!p.jobId)
    && text(p.title, 300) && !!p.title.trim() && text(p.company, 200) && validDate(p.date)
    && (p.time === "" || typeof p.time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(p.time))
    && zone && Number.isInteger(p.duration) && Number(p.duration) >= 5 && Number(p.duration) <= 1440
    && text(p.location, 500) && safeUrl(p.url) && text(p.notes, 10000)
    && (kind === "event" ? eventResults : results).includes(p.result as never);
}
export function parseWorkspace(raw: string | null, workspace: string): WorkspaceSnapshot {
  if (raw === null) return { version: 1, workspace, entries: [] };
  if (raw.length > 5_000_000) throw new Error("备份太大，请检查文件。");
  let value;
  try { value = JSON.parse(raw); } catch { throw new Error("本机数据无法读取。请保留原数据，不要清空浏览器。"); }
  if (!value || value.version !== 1 || value.workspace !== workspace || !Array.isArray(value.entries) || value.entries.length > 5000) {
    throw new Error("数据版本或工作区不匹配。请选择当前工作区导出的备份。");
  }
  const ids = new Set<string>();
  for (const e of value.entries) {
    if (!e || !text(e.id, 150) || !/^[a-zA-Z0-9_-]+$/.test(e.id) || ids.has(e.id)
      || !["job", "interview", "event"].includes(e.kind) || typeof e.archived !== "boolean"
      || !Number.isSafeInteger(e.revision) || e.revision < 1 || !text(e.updatedAt, 100)
      || !Number.isFinite(Date.parse(e.updatedAt)) || !validPayload(e.kind, e.payload)) {
      throw new Error("备份含无效或重复记录；未修改任何数据。");
    }
    ids.add(e.id);
  }
  return value;
}
export function commitEntry(storage: StoragePort, key: string, id: string, kind: EntryKind, payload: JobFields | ScheduleFields, expectedRevision: number, archived: boolean, knownIds: Set<string>): WorkspaceSnapshot {
  const current = parseWorkspace(storage.getItem(key), key);
  if (!/^[a-zA-Z0-9_-]{1,150}$/.test(id) || !validPayload(kind, payload) || !Number.isSafeInteger(expectedRevision) || expectedRevision < 0) {
    throw new Error("请检查名称、日期、时间、时区与链接。");
  }
  const old = current.entries.find(entry => entry.id === id);
  if (old && old.kind !== kind) throw new Error("记录类型不可更改。");
  if ((old?.revision ?? 0) !== expectedRevision) throw new Error("记录已在另一处修改。请保留草稿，关闭后重新打开最新记录。");
  const jobs = new Set([...knownIds, ...current.entries.filter(e => e.kind === "job").map(e => e.id)]);
  if (kind !== "job" && (payload as ScheduleFields).jobId && !jobs.has((payload as ScheduleFields).jobId)) {
    throw new Error("关联岗位不存在，请重新选择。");
  }
  const entry: Entry = { id, kind, payload: structuredClone(payload), archived, revision: expectedRevision + 1, updatedAt: new Date().toISOString() };
  const next: WorkspaceSnapshot = { ...current, entries: [...current.entries.filter(e => e.id !== id), entry] };
  parseWorkspace(JSON.stringify(next), key);
  storage.setItem(key, JSON.stringify(next));
  return next;
}
/** Incremental restore never overwrites an existing edit, even from an older backup. */
export function restoreWorkspace(storage: StoragePort, key: string, raw: string): WorkspaceSnapshot {
  const imported = parseWorkspace(raw, key), current = parseWorkspace(storage.getItem(key), key);
  const ids = new Set(current.entries.map(e => e.id));
  const next = { ...current, entries: [...current.entries, ...imported.entries.filter(e => !ids.has(e.id))] };
  // Revalidate the combined size and uniqueness before writing anything.
  parseWorkspace(JSON.stringify(next), key);
  storage.setItem(key, JSON.stringify(next));
  return next;
}
