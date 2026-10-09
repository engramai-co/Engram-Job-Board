import { data, jdEvidence, safeExternalUrl } from "../lib";

export function ResearchRegisters() {
  const { rejectedRoles, noQualifying, secondaryGeography } = data.research;
  return (
    <div className="research-registers" aria-label="研究核验记录">
      <details className="evidence-register">
        <summary><span><strong>暂不推进</strong><small>职责或级别不符，或当前没有合格 JD</small></span><span className="register-count"><b>{rejectedRoles.length}</b> 条具体 JD</span></summary>
        <div className="register-body">
          <div><h3>排除的具体 JD</h3><div className="evidence-list">
            {rejectedRoles.map((item) => <article className="evidence-row" key={`${item.company}-${item.title}`}>
              <div><strong>{item.company}</strong>{safeExternalUrl(item.url) ? <a href={safeExternalUrl(item.url)} target="_blank" rel="noreferrer">{item.title}</a> : <span>{item.title}</span>}</div><p>{item.reason}</p>
              {item.replacement && <p className="evidence-row__replacement"><b>替代岗位</b>{safeExternalUrl(item.replacement.url) ? <a href={safeExternalUrl(item.replacement.url)} target="_blank" rel="noreferrer">{item.replacement.title}</a> : <span>{item.replacement.title}</span>}</p>}
              <small>{jdEvidence(item.status, item.checkedAt)}</small>
            </article>)}
          </div></div>
          <div><h3>暂未找到合格的开放 JD</h3><div className="company-screen-list">
            {noQualifying.map((item) => <article className="company-screen-row" key={item.company}><strong>{item.company}</strong><p>{item.reason}</p>{item.inspectedJd && (safeExternalUrl(item.inspectedJd.url) ? <a href={safeExternalUrl(item.inspectedJd.url)} target="_blank" rel="noreferrer">已查看： {item.inspectedJd.title}</a> : <span>{item.inspectedJd.title}</span>)}</article>)}
          </div></div>
        </div>
      </details>
      <details className="evidence-register">
        <summary><span><strong>其他地区</strong><small>非优先地点的岗位，单独评估</small></span><span className="register-count"><b>{secondaryGeography.length}</b> 条关注记录</span></summary>
        <div className="secondary-list">
          {secondaryGeography.map((item) => <article className="secondary-row" key={`${item.company}-${item.role}`}>
            <div className="secondary-row__heading"><div><strong>{item.company}</strong>{safeExternalUrl(item.jd.url) ? <a href={safeExternalUrl(item.jd.url)} target="_blank" rel="noreferrer">{item.role}</a> : <span>{item.role}</span>}</div><span className="tag tag--muted">其他地区</span></div>
            <dl><div><dt>地点 / 团队</dt><dd>{item.location} · {item.team}</dd></div><div><dt>值得考虑的原因</dt><dd>{item.fitReason}</dd></div><div><dt>资格门槛</dt><dd>{item.eligibility}</dd></div><div><dt>主要缺口</dt><dd>{item.hardGap}</dd></div><div><dt>薪资</dt><dd>{item.compensation.display} · {item.compensation.source}</dd></div><div><dt>下一步</dt><dd>{item.nextStep}</dd></div></dl>
            <small>{jdEvidence(item.jd.status, item.jd.checkedAt)}</small>
          </article>)}
        </div>
      </details>
    </div>
  );
}
