import { useCallback, useState } from "react";
import { ApplicationTable } from "../components/ApplicationTable";
import { InterviewProcess } from "../components/InterviewProcess";
import { OfferBaseline } from "../components/OfferBaseline";
import { PortfolioChart, type ChartFilter } from "../components/PortfolioChart";
import { SearchCalendar } from "../components/SearchCalendar";
import { getPortfolioItems } from "../lib";
import type { MixView } from "../types";

export function ApplicationTracker() {
  const portfolioItems = getPortfolioItems();
  const [mixView, setMixView] = useState<MixView>("status");
  const [filter, setFilter] = useState<ChartFilter | null>(null);
  const handleSliceSelect = useCallback((next: ChartFilter | null) => setFilter(next), []);

  const handleViewChange = (next: MixView) => {
    setMixView(next);
    setFilter(null);
  };

  return (
    <>
      <PortfolioChart items={portfolioItems} view={mixView} selected={filter} onViewChange={handleViewChange} onSliceSelect={handleSliceSelect} />
      <ApplicationTable items={portfolioItems} filter={filter} onClear={() => setFilter(null)} />
      <OfferBaseline />
      <InterviewProcess />
      <SearchCalendar />
    </>
  );
}
