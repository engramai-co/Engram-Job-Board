import assert from "node:assert/strict";
import { test } from "node:test";
import { jobFields, scheduleFields, sourceSchedules } from "../src/tracker-model.ts";
import type { DashboardData } from "../src/types.ts";
import { commitEntry, parseWorkspace, restoreWorkspace, validPayload, type StoragePort } from "../src/workspace-store.ts";

const key = "test-workspace";
const job = () => ({ ...jobFields(), company: "Demo Studio", role: "Video Editor" });
function memory(): StoragePort {
  const values = new Map<string, string>();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); } };
}
function save(storage: StoragePort, id = "demo-job", revision = 0, stage = "Researching" as ReturnType<typeof job>["stage"], archived = false) {
  return commitEntry(storage, key, id, "job", {...job(), stage}, revision, archived, new Set());
}

test("job state persists across reads and archives are reversible", () => {
  const storage = memory();
  save(storage);
  save(storage, "demo-job", 1, "Applied");
  assert.equal(parseWorkspace(storage.getItem(key), key).entries[0].payload.stage, "Applied");
  const archived = save(storage, "demo-job", 2, "Applied", true);
  assert.equal(archived.entries[0].archived, true);
  assert.equal(save(storage, "demo-job", 3, "Applied").entries[0].archived, false);
});

test("stale edits are rejected without overwriting newer data; unrelated writes are preserved", () => {
  const storage = memory();
  save(storage);
  save(storage, "second-job");
  save(storage, "demo-job", 1, "Interviewing");
  const before = storage.getItem(key);
  assert.throws(() => save(storage, "demo-job", 1, "Rejected"), /另一处修改/);
  assert.equal(storage.getItem(key), before);
  assert.equal(parseWorkspace(before, key).entries.length, 2);
});

test("invalid or corrupt storage is never silently replaced", () => {
  const storage = memory();
  storage.setItem(key, "{broken");
  assert.throws(() => save(storage), /无法读取/);
  assert.equal(storage.getItem(key), "{broken");
  assert.throws(() => parseWorkspace(JSON.stringify({version: 2, workspace: key, entries: []}), key), /版本/);
});

test("storage write failures propagate and cannot be mistaken for a successful save", () => {
  const storage = memory();
  save(storage);
  const before = storage.getItem(key);
  const full = {...storage, setItem() { throw new Error("QuotaExceededError"); }};
  assert.throws(() => save(full, "demo-job", 1, "Applied"), /QuotaExceededError/);
  assert.equal(storage.getItem(key), before);
});

test("payload validation rejects unsafe URLs, impossible dates and invalid time zones", () => {
  assert.equal(validPayload("job", job()), true);
  for (const change of [{url: "javascript:alert(1)"}, {appliedDate: "2026-02-30"}, {stage: "invented"}, {company: " "}]) {
    assert.equal(validPayload("job", {...job(), ...change}), false);
  }
  const interview = {...scheduleFields("demo-job", "2026-10-12"), title: "Portfolio review"};
  assert.equal(validPayload("interview", interview), true);
  for (const change of [{time: "24:00"}, {timeZone: "Fake/Zone"}, {duration: 0}, {jobId: ""}]) {
    assert.equal(validPayload("interview", {...interview, ...change}), false);
  }
});

test("interviews require a known job and cannot overwrite a job record", () => {
  const storage = memory();
  const interview = {...scheduleFields("demo-job", "2026-10-12"), title: "Portfolio review"};
  assert.throws(() => commitEntry(storage, key, "meeting", "interview", interview, 0, false, new Set()), /关联岗位不存在/);
  save(storage);
  assert.equal(commitEntry(storage, key, "meeting", "interview", interview, 0, false, new Set()).entries.length, 2);
  assert.throws(() => commitEntry(storage, key, "demo-job", "interview", interview, 1, false, new Set()), /类型不可更改/);
});

test("backup restore is incremental, validates workspace and preserves newer edits", () => {
  const storage = memory();
  save(storage);
  const oldBackup = storage.getItem(key)!;
  save(storage, "demo-job", 1, "Rejected");
  restoreWorkspace(storage, key, oldBackup);
  assert.equal(parseWorkspace(storage.getItem(key), key).entries[0].payload.stage, "Rejected");
  const fresh = memory();
  restoreWorkspace(fresh, key, oldBackup);
  assert.equal(parseWorkspace(fresh.getItem(key), key).entries.length, 1);
  const before = storage.getItem(key);
  assert.throws(() => restoreWorkspace(storage, key, oldBackup.replace('"workspace":"test-workspace"', '"workspace":"other"')), /工作区不匹配/);
  assert.equal(storage.getItem(key), before);
});

test("backups reject duplicate IDs and oversized payloads atomically", () => {
  const storage = memory();
  const saved = save(storage);
  const before = storage.getItem(key);
  assert.throws(() => restoreWorkspace(storage, key, JSON.stringify({...saved, entries: [saved.entries[0], saved.entries[0]]})), /重复/);
  assert.throws(() => restoreWorkspace(storage, key, " ".repeat(5_000_001)), /太大/);
  assert.equal(storage.getItem(key), before);
});

test("legacy source interviews and events keep stable identities and can be edited without duplication", () => {
  const data = {opportunities:[{id:"demo-job",company:"Demo"}],interviews:[{opportunityId:"demo-job",date:"2026-10-12",stage:"Portfolio review",status:"Source note"}],events:[{date:"2026-10-10",title:"Demo meetup"}]} as DashboardData;
  const sources = sourceSchedules(data);
  assert.equal(sources.length, 2);
  assert.deepEqual(sourceSchedules(structuredClone(data)), sources);
  const source = sources[0], storage = memory();
  const result = commitEntry(storage,key,source.id,source.kind,{...source.payload,result:"通过"},0,false,new Set(["demo-job"]));
  const merged = [...new Map([...sources,...result.entries].map(entry=>[entry.id,entry])).values()];
  assert.equal(merged.length, 2);
  assert.equal(merged.find(entry=>entry.id===source.id)!.revision, 1);
});
