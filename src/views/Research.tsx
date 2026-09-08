import { useCallback, useState } from "react";
import { ResearchCharts, researchStatusOrder, type ResearchFilterState } from "../components/ResearchCharts";
import { ResearchRegisters } from "../components/ResearchRegisters";
import { ResearchTable } from "../components/ResearchTable";
import { data, formatDate, getResearchItems, parseLocalDate, safeExternalUrl } from "../lib";

export function Research() {
  const researchItems = getResearchItems();
  const [filter, setFilter] = useState<ResearchFilterState>({});
  const setResearchFilter = useCallback((next: ResearchFilterState) => setFilter(next), []);
  const visibleItems = researchItems.filter((item) =>
    (!filter.status || item.researchStatus === filter.status) &&
    (!filter.industry || item.industry === filter.industry)
  );
  const evidenceJds = [...data.opportunities.map((item) => item.jd), ...data.research.rejectedRoles, ...data.research.secondaryGeography.map((item) => item.jd)];
  const checkedJds = evidenceJds.filter((item) => item.status !== "Unchecked" && item.checkedAt && safeExternalUrl(item.url));
  const liveCount = checkedJds.filter((item) => item.status === "Live").length;
  const filterLabel = [filter.status, filter.industry].filter(Boolean).join(" · ");

  return (
    <>
      <section className="queue-section research-summary" aria-labelledby="queue-heading">
        <div className="section-heading"><div><h2 id="queue-heading">Research pipeline</h2><p>{data.research.scope}</p></div><div className="queue-total"><strong>{researchItems.length}</strong><span>research records</span></div></div>
        <ResearchCharts items={researchItems} filter={filter} onFilterChange={setResearchFilter} />
        <div className="research-proof" aria-label="Research coverage">
          <div><strong>{checkedJds.length}</strong><span>JDs with dated check evidence</span></div>
          <div><strong>{liveCount}</strong><span>marked live at last check</span></div>
          <div><strong>{formatDate(parseLocalDate(data.research.asOf), { day: "2-digit", month: "short", year: "numeric" })}</strong><span>data snapshot—not a live check</span></div>
          <div><strong>{data.research.excludedCompanies.length ? data.research.excludedCompanies.join(", ") : "No company exclusions"}</strong><span>{data.research.noQualifying.length} screens without a qualifying JD</span></div>
        </div>
        <div className="research-toolbar">
          <div className="research-filters" role="group" aria-label="Filter exact-JD research by decision taxonomy">
            <button className={`research-filter${!filter.status && !filter.industry ? " is-selected" : ""}`} type="button" aria-pressed={!filter.status && !filter.industry} onClick={() => setFilter({})}><span>All research</span><strong>{researchItems.length}</strong></button>
            {researchStatusOrder.map((status) => {
              const count = researchItems.filter((item) => item.researchStatus === status).length;
              return <button className={`research-filter${filter.status === status && !filter.industry ? " is-selected" : ""}`} type="button" key={status} aria-pressed={filter.status === status && !filter.industry} onClick={() => setFilter(filter.status === status && !filter.industry ? {} : { status })}><span>{status}</span><strong>{count}</strong></button>;
            })}
          </div>
          <div className="research-toolbar__result">
            {filterLabel && <button className="active-chart-filter" type="button" onClick={() => setFilter({})}><span>{filterLabel}</span><b aria-hidden="true">×</b><span className="sr-only">Clear research filter</span></button>}
            <p aria-live="polite"><strong>{visibleItems.length}</strong> rows shown</p>
          </div>
        </div>
        <ResearchTable opportunities={visibleItems} />
        <ResearchRegisters />
      </section>
    </>
  );
}
