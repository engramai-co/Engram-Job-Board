import { Fragment, useEffect, useState } from "react";
import { displayLabel, jdEvidence, jdSourceLabel, portfolioStages, researchDecisionLabel, researchStatusClass, safeExternalUrl, stageClass } from "../lib";
import { dimensionScore, dimensionsForProfile, rankOpportunities, scoreLabel, scoreProfiles, type ScoreProfile } from "../ranking";
import type { Opportunity } from "../types";
import { WorkTermsSummary } from "./CareerBrief";
import { JDReferences } from "./JDReferences";
import { StatusControl } from "./ApplicationTable";
import { Button } from '@mantine/core';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { RecordActions } from './RecordActions';
import { ResearchFreshness } from './ResearchFreshness';
import { londonDate } from '../research-freshness';

export function ResearchTable({ opportunities, allOpportunities = opportunities, focusedJob, onShowApplications, scoreProfile, rankingLabel = "本组" }: { opportunities: Opportunity[]; allOpportunities?: Opportunity[]; focusedJob: string | null; onShowApplications: () => void; scoreProfile?: ScoreProfile; rankingLabel?: string }) {
  const [expanded, setExpanded] = useState<string | null>(focusedJob);
  const [today, setToday] = useState(londonDate);
  useEffect(() => {
    const timer = window.setInterval(() => setToday(londonDate()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  const focusVisible = opportunities.some(item => item.id === focusedJob);
  useEffect(() => {
    if (!focusedJob) return;
    document.getElementById("job-" + focusedJob)?.scrollIntoView({ block: "start" });
    document.getElementById("job-" + focusedJob)?.focus({ preventScroll: true });
  }, [focusedJob, focusVisible]);
  const visibleIds = new Set(opportunities.map((item) => item.id));
  const dimensions = dimensionsForProfile(scoreProfile);
  const scoreTitle = scoreProfile ? scoreProfiles[scoreProfile].label : "参考匹配分";
  const ranked = rankOpportunities(allOpportunities, scoreProfile).filter(({ item }) => visibleIds.has(item.id));
  if (!ranked.length) return <div className="empty-ledger"><div><h3>当前筛选下没有岗位</h3><p>更换或清除筛选，即可查看其他已记录的 JD。</p></div></div>;

  return <div className="ranking-ledger"><table className="ranking-table">
    <caption className="sr-only">{rankingLabel}的百分制匹配排名。未知细项显示可能区间，按有依据的下界降序，同分并列，筛选保留组内排名。不同组不混排。时效、资格、申请结果均不自动筛除或降低匹配分。</caption>
    <thead><tr><th scope="col">{scoreTitle}</th><th scope="col">公司与职位 / JD 来源</th><th scope="col">维度评分 · 百分制</th><th scope="col">备注与下一步</th></tr></thead>
    <tbody>{ranked.map(({ item, total, range, rank }) => <Fragment key={item.id}>
      <tr id={"job-" + item.id} tabIndex={-1} className={"ranking-row" + (expanded === item.id ? " is-expanded" : "")}>
        <td className="rank-cell">
          <div className="rank-summary">
            <strong className="rank-total" aria-label={range === null ? "尚未评分" : `${scoreTitle} ${scoreLabel(range)}，100 分制；区间来自待补细项，排名采用已支持下界`}>{scoreLabel(range)}</strong>
            {total !== null && <span className="rank-meter" aria-hidden="true"><span style={{ width: `${total}%` }}/></span>}
            <span className="rank-number" aria-label={rank === null ? "未排名" : `${rankingLabel}组内排名第 ${rank}`}>{rank === null ? "未排名" : "组内 #" + rank}</span>
            {range && range.coverage < 100 && <span className="rank-pending">细项待补</span>}
          </div>
        </td>
        <td className="rank-job"><strong className="rank-company">{item.company}</strong>
          {safeExternalUrl(item.jd.url) ? <a href={safeExternalUrl(item.jd.url)} target="_blank" rel="noreferrer" className="rank-jd">{item.role}<span className="sr-only">（{jdSourceLabel(item.jd)}，在新标签页打开）</span></a> : <span>{item.role}</span>}
          <p className="rank-meta">{displayLabel(item.location)} · {displayLabel(item.work?.contract || "Contract unconfirmed")}</p>
          <div className="job-progress"><StatusControl item={item}/>{portfolioStages.has(item.stage) && <Button variant="subtle" size="compact-sm" onClick={onShowApplications}>申请追踪</Button>}<RecordActions id={item.id} company={item.company} url={item.jd.url}/></div>
          {item.personalNotes && <p className="rank-meta clamp-text">我的备注：{item.personalNotes}</p>}
          <span className={"rank-availability" + (item.jd.status !== "Live" ? " is-uncertain" : "")}>{jdSourceLabel(item.jd)} · {jdEvidence(item.jd.status, item.jd.checkedAt, item.jd.verification)}</span>
          {!portfolioStages.has(item.stage) && <ResearchFreshness jd={item.jd} today={today}/>}
          {item.jd.note && <p className="rank-meta">{item.jd.note}</p>}
          <JDReferences jd={item.jd} />
          {item.discovery && <p className="rank-meta">{safeExternalUrl(item.discovery.url) ? <a href={safeExternalUrl(item.discovery.url)} target="_blank" rel="noreferrer">{item.discovery.source} 来源</a> : item.discovery.source} · {item.discovery.postingKind === "Reposted" ? "重新发布" : "发布标记"} {item.discovery.postedLabel}<br/><time dateTime={item.discovery.checkedAt}>{item.discovery.checkedAt}</time> 查看</p>}
          <Button variant="subtle" size="compact-sm" className="ui-research-expand" rightSection={expanded === item.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>} aria-label={(expanded === item.id ? "收起 " : "查看 ") + item.company + " " + item.role + " 的评分与 JD 依据"} aria-expanded={expanded === item.id} aria-controls={"detail-" + item.id} onClick={() => setExpanded(expanded === item.id ? null : item.id)}>{expanded === item.id ? "收起详情" : "评分依据与详情"}</Button>
        </td>
        <td className="rank-scores"><span className="rank-mobile-label">维度评分 · 百分制</span>{item.detailedAssessment ? <div className="score-strip">{dimensions.map(({ key, short, label, weight }) => {
          const score = dimensionScore(item.detailedAssessment, key);
          return <div className="score-metric" key={key} aria-label={label + " " + scoreLabel(score) + "，权重 " + weight + "%"}>
            <span>{short}</span><strong>{scoreLabel(score)}</strong><span className="score-line" aria-hidden="true"><span style={{width:`${score?.min ?? 0}%`}}/></span>
          </div>;
        })}</div> : <span>尚未评分</span>}</td>
        <td className="rank-decision"><span className={"tag " + researchStatusClass(item.researchStatus)}>{researchDecisionLabel(item.researchStatus)}</span><p>{item.detailedAssessment?.reservation || item.hardGap}</p>{item.work?.deadline && <p className="rank-deadline">截止 <time dateTime={item.work.deadline}>{item.work.deadline}</time></p>}</td>
      </tr>
      <tr className="rank-detail-row" id={"detail-" + item.id} hidden={expanded !== item.id}><td colSpan={4}>
        {expanded === item.id && <div className="rank-detail">
          <section className="rank-rationale"><h3>评分细项与依据</h3><p className="assessment-date">基于已有 JD / CV 材料重评 · {item.detailedAssessment?.assessedAt || "尚未评分"} · 不代表重新核验 JD 或录用概率</p>
            {item.detailedAssessment && <><p className="score-explanation">每项按 0–100 分判断。待补细项形成可能区间，不默认高分、不认定不满足；排序采用已支持下界。资格条件只备注，不自动过滤。</p>
              <p className="score-explanation">当前口径：{scoreTitle}。{dimensions.map(d => `${d.short} ${d.weight}%`).join(" · ")}；排名仅在{rankingLabel}内比较。</p>
              {dimensions.map(({key, label, weight, criteria}) => <section className="score-dimension-detail" key={key}>
                <h4>{label}<span>{scoreLabel(dimensionScore(item.detailedAssessment,key))} · 总权重 {weight}%</span></h4>
                <p>{item.detailedAssessment!.dimensions[key].reason}</p>
                <dl className="score-criteria">{criteria.map(c => {
                  const score = item.detailedAssessment!.dimensions[key].criteria[c.key];
                  return <div key={c.key}><dt>{c.label}<span>{score.value === null ? "待补证据" : score.value}<small>维度内 {c.weight}%</small></span></dt><dd>{score.reason}</dd></div>;
                })}</dl>
              </section>)}
            </>}
          </section>
          <section><h3>JD 与经历依据</h3><p>{item.fitReason}</p><dl className="rank-evidence"><div><dt>团队与工作</dt><dd>{item.team}。{item.alignment.evidence}</dd></div><div><dt>资格条件（仅备注）</dt><dd>{item.eligibility}</dd></div><div><dt>缺口 / 未知项</dt><dd>{item.hardGap}</dd></div>{item.discovery && <div><dt>来源与发布时间</dt><dd>{item.discovery.source} 在 {item.discovery.checkedAt} 显示“{item.discovery.postedLabel}”{item.discovery.postingKind === "Reposted" ? "（重新发布）" : "（发布标记）"}。{item.discovery.officialPostedAt && <>官方发布时间：{item.discovery.officialPostedAt}。</>}{item.discovery.note}</dd></div>}{item.culture && <div><dt>团队文化</dt><dd>{item.culture.summary}（{item.culture.confidence}）</dd></div>}</dl></section>
          <section><h3>合同与薪资</h3><div className="rank-work"><WorkTermsSummary work={item.work}/></div><p><strong>{item.compensation.display}</strong></p><p>{item.compensation.source}。{item.compensation.confidence}</p>{item.work && <p>作品要求：{item.work.portfolio}</p>}</section>
          <section className="rank-next"><h3>下一步</h3><p>{item.nextStep}</p><p className="assessment-date">申请状态：{displayLabel(item.stage)} · {item.status}</p></section>
        </div>}
      </td></tr>
    </Fragment>)}</tbody>
  </table></div>;
}
