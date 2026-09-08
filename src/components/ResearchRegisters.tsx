import { data, jdEvidence, safeExternalUrl } from "../lib";

export function ResearchRegisters() {
  const { rejectedRoles, noQualifying, secondaryGeography } = data.research;
  return (
    <div className="research-registers" aria-label="Research evidence registers">
      <details className="evidence-register">
        <summary><span><strong>Screened out</strong><small>Wrong mandate, wrong level, or no qualifying current JD</small></span><span className="register-count"><b>{rejectedRoles.length}</b> exact JDs</span></summary>
        <div className="register-body">
          <div><h3>Rejected exact JDs</h3><div className="evidence-list">
            {rejectedRoles.map((item) => <article className="evidence-row" key={`${item.company}-${item.title}`}>
              <div><strong>{item.company}</strong>{safeExternalUrl(item.url) ? <a href={safeExternalUrl(item.url)} target="_blank" rel="noreferrer">{item.title}</a> : <span>{item.title}</span>}</div><p>{item.reason}</p>
              {item.replacement && <p className="evidence-row__replacement"><b>Replacement</b>{safeExternalUrl(item.replacement.url) ? <a href={safeExternalUrl(item.replacement.url)} target="_blank" rel="noreferrer">{item.replacement.title}</a> : <span>{item.replacement.title}</span>}</p>}
              <small>{jdEvidence(item.status, item.checkedAt)}</small>
            </article>)}
          </div></div>
          <div><h3>No qualifying current JD</h3><div className="company-screen-list">
            {noQualifying.map((item) => <article className="company-screen-row" key={item.company}><strong>{item.company}</strong><p>{item.reason}</p>{item.inspectedJd && (safeExternalUrl(item.inspectedJd.url) ? <a href={safeExternalUrl(item.inspectedJd.url)} target="_blank" rel="noreferrer">Inspected: {item.inspectedJd.title}</a> : <span>{item.inspectedJd.title}</span>)}</article>)}
          </div></div>
        </div>
      </details>
      <details className="evidence-register">
        <summary><span><strong>Secondary geography</strong><small>Roles outside your priority locations, evaluated separately</small></span><span className="register-count"><b>{secondaryGeography.length}</b> directional watch</span></summary>
        <div className="secondary-list">
          {secondaryGeography.map((item) => <article className="secondary-row" key={`${item.company}-${item.role}`}>
            <div className="secondary-row__heading"><div><strong>{item.company}</strong>{safeExternalUrl(item.jd.url) ? <a href={safeExternalUrl(item.jd.url)} target="_blank" rel="noreferrer">{item.role}</a> : <span>{item.role}</span>}</div><span className="tag tag--muted">Secondary geography</span></div>
            <dl><div><dt>Location / team</dt><dd>{item.location} · {item.team}</dd></div><div><dt>Why exceptional</dt><dd>{item.fitReason}</dd></div><div><dt>Gate</dt><dd>{item.eligibility}</dd></div><div><dt>Hard gap</dt><dd>{item.hardGap}</dd></div><div><dt>Compensation</dt><dd>{item.compensation.display} · {item.compensation.source}</dd></div><div><dt>Next</dt><dd>{item.nextStep}</dd></div></dl>
            <small>{jdEvidence(item.jd.status, item.jd.checkedAt)}</small>
          </article>)}
        </div>
      </details>
    </div>
  );
}
