import { alignmentClass, hurdleClass, jdEvidence, researchStatusClass, safeExternalUrl } from "../lib";
import type { Opportunity } from "../types";

function ExternalLinkIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M8 4h8v8M16 4l-9 9"/><path d="M13 11v5H4V7h5"/></svg>;
}

export function ResearchTable({ opportunities }: { opportunities: Opportunity[] }) {
  if (!opportunities.length) {
    return <div className="empty-ledger"><div><h3>No roles in this research view</h3><p>Choose another research filter to restore exact-JD candidates.</p></div></div>;
  }

  return (
    <div className="ledger-table-wrap">
      <table className="ledger-table">
        <thead><tr><th>Company / exact JD</th><th>Research call</th><th>Location / team</th><th>Compensation evidence</th><th>Hurdle read</th><th>Fit / gate / next move</th></tr></thead>
        <tbody>
          {opportunities.map((opportunity) => (
            <tr key={opportunity.id}>
              <td className="company-cell" data-label="Company / exact JD">
                <div className="company-cell__heading"><strong>{opportunity.company}</strong></div>
                {safeExternalUrl(opportunity.jd.url) ? <a className="jd-link" href={safeExternalUrl(opportunity.jd.url)} target="_blank" rel="noreferrer"><span>{opportunity.role}</span><ExternalLinkIcon /></a> : <span className="application-role application-role--plain">{opportunity.role}</span>}
                <small className={`jd-status${opportunity.jd.status === "Live" ? "" : " jd-status--evergreen"}`}><i aria-hidden="true"/>{jdEvidence(opportunity.jd.status, opportunity.jd.checkedAt)}{!safeExternalUrl(opportunity.jd.url) && " · no official JD link"}</small>
              </td>
              <td data-label="Research call">
                <span className={`tag ${researchStatusClass(opportunity.researchStatus)}`}>{opportunity.researchStatus}</span>
                <span className={`tag alignment-tag ${alignmentClass(opportunity.alignment.tone)}`}>{opportunity.alignment.label}</span>
                <small className="cell-note">{opportunity.category}</small><small className="cell-note">{opportunity.stage}</small>
              </td>
              <td data-label="Location / team">{opportunity.location}<small className="cell-note">{opportunity.team}</small><small className="cell-note">{opportunity.geographyPriority} geography · {opportunity.industry}</small></td>
              <td className="compensation-cell" data-label="Compensation evidence"><strong>{opportunity.compensation.display}</strong><small>{opportunity.compensation.source}</small><small className="comp-confidence">{opportunity.compensation.confidence}</small></td>
              <td data-label="Hurdle read"><span className={`tag ${hurdleClass(opportunity.compensation.hurdle)}`}>{opportunity.compensation.hurdleLabel}</span><small className="cell-note">{opportunity.compensation.verified ? "Verified" : "Not offer-verified"}</small></td>
              <td className="diligence-cell" data-label="Fit / gate / next move">
                <p>{opportunity.fitReason}</p>
                <span className="diligence-line diligence-line--evidence"><b>Mandate</b>{opportunity.alignment.evidence}</span>
                {opportunity.culture && <span className="diligence-line"><b>Culture</b>{opportunity.culture.summary} ({opportunity.culture.confidence})</span>}
                <span className="diligence-line"><b>Gate</b>{opportunity.eligibility}</span>
                <span className="diligence-line diligence-line--gap"><b>Gap</b>{opportunity.hardGap}</span>
                <span className="diligence-line diligence-line--next"><b>Next</b>{opportunity.nextStep}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
