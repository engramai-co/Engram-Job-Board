import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type Context, type ReactNode } from "react";
import { data } from "./lib";
import { isDemoData } from "./data/opportunities";
import type { Opportunity } from "./types";
import { jobFields, mergeWorkspace, sourceSchedules, type Entry, type EntryKind, type JobFields, type ScheduleFields } from "./tracker-model";
import { commitEntry, parseWorkspace, restoreWorkspace } from "./workspace-store";

export const workspaceKey = "engram-job-board:v1:" + (isDemoData ? "demo" : "local") + ":" + encodeURIComponent(data.profile.name + ":" + data.profile.cycle);
interface ProgressContextValue {
  opportunities: Opportunity[]; allOpportunities: Opportunity[]; entries: Entry[];
  loading: boolean; ready: boolean; busyId: string | null; error: string;
  notice: { text: string } | null; dismissNotice: () => void; refresh: () => Promise<void>;
  markApplied: (id: string, applied: boolean) => Promise<void>;
  saveEntry: (id: string, kind: EntryKind, payload: JobFields | ScheduleFields, expectedRevision: number, archived?: boolean) => Promise<boolean>;
  exportBackup: () => string; importBackup: (raw: string) => Promise<boolean>;
}
// Preserve context identity when Vite refreshes provider and consumers independently.
const ProgressContext: Context<ProgressContextValue | null> = import.meta.hot?.data.progressContext ?? createContext<ProgressContextValue | null>(null);
if (import.meta.hot) import.meta.hot.data.progressContext = ProgressContext;
export function ProgressProvider({ children }: { children: ReactNode }) {
  const [storedEntries, setEntries] = useState<Entry[]>([]);
  const entries = useMemo(() => [...new Map([...sourceSchedules(data), ...storedEntries].map(entry => [entry.id, entry])).values()], [storedEntries]);
  const [loading, setLoading] = useState(true), [ready, setReady] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null), busy = useRef(false);
  const [error, setError] = useState(""), [notice, setNotice] = useState<{text: string} | null>(null);
  const refresh = useCallback(async () => {
    if (busy.current) return;
    setLoading(true);
    try {
      setEntries(parseWorkspace(localStorage.getItem(workspaceKey), workspaceKey).entries);
      setReady(true); setError("");
    } catch (e) {
      setReady(false); setError(e instanceof Error ? e.message : "无法读取浏览器数据，请检查存储权限。");
    } finally { setLoading(false); }
  }, []);
  useEffect(() => {
    void refresh();
    const onStorage = (event: StorageEvent) => { if (event.key === workspaceKey || event.key === null) void refresh(); };
    const onFocus = () => { void refresh(); };
    window.addEventListener("storage", onStorage); window.addEventListener("focus", onFocus);
    return () => { window.removeEventListener("storage", onStorage); window.removeEventListener("focus", onFocus); };
  }, [refresh]);
  const write = async (id: string, operation: () => Entry[], message: string) => {
    if (!ready || busy.current) return false;
    busy.current = true; setBusyId(id); setError(""); setNotice(null);
    try {
      // Serialize same-origin tabs, then check the record revision inside the lock.
      if (!navigator.locks) throw new Error("此浏览器不支持安全的多标签页保存。请使用新版浏览器或 localhost / HTTPS。");
      await navigator.locks.request(workspaceKey, () => setEntries(operation()));
      setNotice({text: message}); return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "无法保存，请检查浏览器存储空间与权限。");
      return false;
    } finally { busy.current = false; setBusyId(null); }
  };
  const saveEntry: ProgressContextValue["saveEntry"] = async (id, kind, payload, revision, archived = false) =>
    write(id, () => commitEntry(localStorage, workspaceKey, id, kind, payload, revision, archived, new Set(data.opportunities.map(j => j.id))).entries,
      archived ? "已归档，可在归档记录中恢复。" : "已保存到当前浏览器，关联视图已同步。");
  const allOpportunities = useMemo(() => mergeWorkspace(data.opportunities, entries), [entries]);
  const opportunities = useMemo(() => allOpportunities.filter(item => !item.archived), [allOpportunities]);
  const markApplied = async (id: string, applied: boolean) => {
    const job = allOpportunities.find(item => item.id === id);
    if (job) await saveEntry(id, "job", {...jobFields(job), stage: applied ? "Applied" : "Researching"}, entries.find(e => e.id === id)?.revision ?? 0);
  };
  const exportBackup = () => JSON.stringify(parseWorkspace(localStorage.getItem(workspaceKey), workspaceKey), null, 2);
  const importBackup = (raw: string) => write("backup", () => restoreWorkspace(localStorage, workspaceKey, raw).entries,
    "备份已增量恢复。已有记录保留原样，未被覆盖。");
  return <ProgressContext.Provider value={{opportunities, allOpportunities, entries, loading, ready, busyId, error, notice,
    dismissNotice: () => setNotice(null), refresh, markApplied, saveEntry, exportBackup, importBackup}}>{children}</ProgressContext.Provider>;
}
export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("Missing progress provider");
  return context;
}
