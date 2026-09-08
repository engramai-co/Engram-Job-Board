import { formatDate, portfolioDimension, safeExternalUrl, stageClass } from "../lib";
import type { PortfolioItem } from "../types";
import type { ChartFilter } from "./PortfolioChart";

function ExternalLinkIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M8 4h8v8M16 4l-9 9"/><path d="M13 11v5H4V7h5"/></svg>;
}

export function ApplicationTable({ items, filter, onClear }: { items: PortfolioItem[]; filter: ChartFilter | null; onClear: () => void }) {
  const visibleItems = filter ? items.filter((item) => portfolioDimension(item, filter.view) === filter.label) : items;

  return (
    <section className="application-ledger" aria-labelledby="applied-heading">
      <div className="application-ledger__heading">
        <div>
          <h2 id="applied-heading">Applied tracker</h2>
          <p>Submitted roles and offers only. Research candidates are kept in their own view.</p>
        </div>
        <div className="application-ledger__tools">
          {filter && <button className="active-chart-filter" type="button" onClick={onClear}><span>{filter.label}</span><b aria-hidden="true">×</b><span className="sr-only">Clear chart filter</span></button>}
          <div className="queue-total"><strong>{visibleItems.length}</strong><span>{filter ? `of ${items.length}` : "portfolio records"}</span></div>
        </div>
      </div>
      <div className="application-table-wrap">
        <table className="application-table">
          <thead><tr><th>Company / exact role</th><th>Status</th><th>Confirmation</th><th>Location / team</th><th>Current read / next move</th></tr></thead>
          <tbody>
            {visibleItems.map((item) => {
              const jdUrl = safeExternalUrl(item.jd?.url);
              const confirmedAt = item.application?.confirmedAt
                ? formatDate(new Date(item.application.confirmedAt), { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })
                : "Date not recorded";
              return (
                <tr key={item.id}>
                  <td className="company-cell" data-label="Company / exact role">
                    <div className="company-cell__heading"><strong>{item.company}</strong></div>
                    {jdUrl ? <a className="jd-link application-role" href={jdUrl} target="_blank" rel="noreferrer"><span>{item.role}</span><ExternalLinkIcon /></a> : <span className="application-role application-role--plain">{item.role}</span>}
                    <small className="cell-note">{item.industry} · {item.category}</small>
                  </td>
                  <td data-label="Status"><span className={`tag ${stageClass(item.stage)}`}>{item.stage}</span></td>
                  <td className="application-confirmation" data-label="Confirmation">
                    <strong>{confirmedAt}</strong>
                    <small>{item.application?.evidence || "Confirmation evidence not recorded"}</small>
                    {item.application?.confirmationSubject && <span>{item.application.confirmationSubject}</span>}
                    {item.application?.roleMapping && <small>{item.application.roleMapping}</small>}
                  </td>
                  <td data-label="Location / team">{item.location}<small className="cell-note">{item.team}</small></td>
                  <td className="application-current" data-label="Current read / next move">
                    <strong>{item.compensation.display}</strong>
                    <small>{item.compensation.source}</small>
                    <span><b>Next</b>{item.nextStep}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!visibleItems.length && <div className="application-empty">No portfolio records match this chart selection. Clear the filter to restore all applications.</div>}
      </div>
    </section>
  );
}
