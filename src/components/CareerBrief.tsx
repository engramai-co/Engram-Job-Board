import { data, displayLabel, trackLabel } from "../lib";
import type { TrackFilter } from "../types";
import { SegmentedControl } from '@mantine/core';

export function CareerBrief({ track, onTrackChange }: { track: TrackFilter; onTrackChange: (value: TrackFilter) => void }) {
  const plan = data.searchPlan;
  if (!plan) return null;
  const selected = plan.tracks.find((item) => item.id === track);
  return <section className="career-brief" aria-labelledby="career-heading">
    <div className="career-identity"><div><h2 id="career-heading">{plan.headline}</h2><p>{plan.education}</p></div><span className="career-location">{plan.location}</span></div>
    <div className="career-preferences">{plan.preferences.map((item) => <span key={item}>{item}</span>)}</div>
    <div className="ui-chart-switch"><SegmentedControl aria-label="按入职时间筛选" value={track} onChange={v=>onTrackChange(v as TrackFilter)} data={[{value:'all',label:'全部时间'},...plan.tracks.map(item=>({value:item.id,label:item.title}))]}/></div>
    <p className="career-track-note" aria-live="polite">{selected ? `${selected.description} ${selected.caveat}` : "时间分类仅用于浏览，不用于排除机会。日期未明确的岗位保留在“全部时间”；学业可协调，但学校、雇主和工作许可条件仍需分别确认。"}</p>
  </section>;
}

export function CareerDirections() {
  const plan = data.searchPlan;
  if (!plan) return null;
  const activeCount = plan.families.filter((family) => family.searchStatus === "Active focus").length;
  const pausedCount = plan.families.length - activeCount;
  return <section className="career-directions" aria-labelledby="directions-heading">
    <div className="section-heading"><div><h2 id="directions-heading">求职方向</h2><p>{activeCount} 个主攻方向{pausedCount > 0 ? ` · ${pausedCount} 个暂停搜索` : ""}。结合 CV、Portfolio 与已确认的求职目标，具体岗位条件单独核对。</p></div></div>
    <div className="direction-list">{plan.families.map((family) => <details className="direction-row" key={family.id}>
      <summary><span className="direction-title">{displayLabel(family.label)}</span><span className={`tag ${family.searchStatus === "Active focus" ? "tag--positive" : "tag--muted"}`}>{displayLabel(family.searchStatus)}</span><span className="direction-toggle" aria-hidden="true">+</span></summary>
      <div className="direction-detail"><p>{family.evidence}</p><p><strong>{family.searchStatus === "Search paused" ? "历史关键词（暂不搜索）" : "可搜索的职位名"}</strong> {family.keywords.join(" · ")}</p><p><strong>{family.searchStatus === "Search paused" ? "当前安排" : "准备重点"}</strong> {family.nextStep}</p></div>
    </details>)}</div>
    <details className="career-source-notes"><summary>经历依据与待确认事项</summary><div className="career-source-grid"><div><h3>申请前确认</h3><ul>{plan.checks.map((check) => <li key={check}>{check}</li>)}</ul></div><div><h3>已查阅材料</h3>{plan.sources.map((source) => <p key={source.title}><strong>{source.title}</strong><br/>{source.note}</p>)}</div></div></details>
  </section>;
}

export function WorkTermsSummary({ work }: { work?: import("../types").WorkTerms }) {
  if (!work) return <small className="cell-note">尚未记录工作性质与入职时间</small>;
  return <><span className="tag tag--muted">{displayLabel(work.contract || "Contract unconfirmed")}</span><small className="cell-note">{trackLabel(work.track)} · {work.start}</small><small className="cell-note">{work.hours} · {work.duration}</small><small className="cell-note">{displayLabel(work.workplace)} · {work.travel}</small><small className="cell-note">计薪单位：{displayLabel(work.payUnit)}</small>{work.deadline && <small className="cell-note">截止日期： {work.deadline}</small>}</>;
}
