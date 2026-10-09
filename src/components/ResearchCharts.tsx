import { useEffect, useMemo, useRef } from "react";
import * as echarts from "echarts/core";
import { BarChart } from "echarts/charts";
import { GridComponent, LegendComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { Opportunity, ResearchStatus } from "../types";
import { displayLabel, researchDecisionLabel } from "../lib";

echarts.use([BarChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer]);

export interface ResearchFilterState {
  status?: ResearchStatus;
  industry?: string;
}

export const researchStatusOrder: ResearchStatus[] = [
  "Applied",
  "Rejected",
  "Ready to apply",
  "Needs validation",
  "High-upside reach",
  "Monitor opening",
  "Deprioritized",
  "Not actionable"
];

const statusColors: Record<ResearchStatus, string> = {
  Applied: "#2f6a4f",
  Rejected: "#b6543d",
  "Ready to apply": "#2f6a4f",
  "Needs validation": "#b88935",
  "High-upside reach": "#7d6b91",
  "Monitor opening": "#577c9b",
  Deprioritized: "#9ba477",
  "Not actionable": "#b6543d"
};

export function ResearchCharts({ items, filter, onFilterChange }: { items: Opportunity[]; filter: ResearchFilterState; onFilterChange: (filter: ResearchFilterState) => void }) {
  const taxonomyElement = useRef<HTMLDivElement>(null);
  const landscapeElement = useRef<HTMLDivElement>(null);
  const taxonomyData = useMemo(() => researchStatusOrder.map((status) => ({ status, value: items.filter((item) => item.researchStatus === status).length })), [items]);
  const industries = useMemo(() => Array.from(new Set(items.map((item) => item.industry))).sort((a, b) => items.filter((item) => item.industry === b).length - items.filter((item) => item.industry === a).length), [items]);

  useEffect(() => {
    if (!taxonomyElement.current || !landscapeElement.current) return;
    const taxonomyChart = echarts.init(taxonomyElement.current);
    const landscapeChart = echarts.init(landscapeElement.current);
    const axis = { axisLine: { lineStyle: { color: "#c7cbc2" } }, axisTick: { show: false }, axisLabel: { color: "#657068", fontSize: 11 } };

    taxonomyChart.setOption({
      animationDuration: 480,
      animationEasing: "cubicOut",
      grid: { left: 118, right: 30, top: 22, bottom: 34 },
      tooltip: {
        trigger: "item",
        renderMode: "richText",
        backgroundColor: "#17231c",
        borderWidth: 0,
        textStyle: { color: "#fffef8", fontSize: 12 },
        formatter: ({ name, value }: { name: string; value: number }) => `${researchDecisionLabel(name)}\n${value} 条研究记录`
      },
      xAxis: { type: "value", minInterval: 1, ...axis },
      yAxis: { type: "category", inverse: true, data: taxonomyData.map((item) => item.status), ...axis, axisLabel: { ...axis.axisLabel, formatter: researchDecisionLabel } },
      series: [{
        type: "bar",
        barWidth: 17,
        data: taxonomyData.map((item) => ({ value: item.value, itemStyle: { color: statusColors[item.status], borderRadius: [0, 3, 3, 0], opacity: filter.status && filter.status !== item.status ? 0.28 : 1 } })),
        label: { show: true, position: "right", color: "#17231c", fontSize: 11, fontWeight: 700 }
      }]
    });

    landscapeChart.setOption({
      animationDuration: 520,
      animationEasing: "cubicOut",
      color: researchStatusOrder.map((status) => statusColors[status]),
      grid: { left: 112, right: 24, top: 64, bottom: 34 },
      legend: { type: "scroll", top: 4, left: 0, right: 0, itemWidth: 9, itemHeight: 9, textStyle: { color: "#657068", fontSize: 10 }, formatter: researchDecisionLabel },
      tooltip: {
        trigger: "item",
        renderMode: "richText",
        backgroundColor: "#17231c",
        borderWidth: 0,
        textStyle: { color: "#fffef8", fontSize: 12 },
        formatter: ({ seriesName, name, value }: { seriesName: string; name: string; value: number }) => `${displayLabel(name)}\n${researchDecisionLabel(seriesName)}：${value} 条`
      },
      xAxis: { type: "value", minInterval: 1, ...axis },
      yAxis: { type: "category", inverse: true, data: industries, ...axis, axisLabel: { ...axis.axisLabel, formatter: displayLabel } },
      series: researchStatusOrder.map((status) => ({
        name: status,
        type: "bar",
        stack: "total",
        barWidth: 17,
        emphasis: { focus: "series" },
        data: industries.map((industry) => items.filter((item) => item.industry === industry && item.researchStatus === status).length)
      }))
    });

    taxonomyChart.on("click", (params) => {
      const status = params.name as ResearchStatus;
      onFilterChange(filter.status === status && !filter.industry ? {} : { status });
    });
    landscapeChart.on("click", (params) => {
      const status = params.seriesName as ResearchStatus;
      const industry = params.name;
      onFilterChange(filter.status === status && filter.industry === industry ? {} : { status, industry });
    });

    const resizeObserver = new ResizeObserver(() => { taxonomyChart.resize(); landscapeChart.resize(); });
    resizeObserver.observe(taxonomyElement.current);
    resizeObserver.observe(landscapeElement.current);
    return () => { resizeObserver.disconnect(); taxonomyChart.dispose(); landscapeChart.dispose(); };
  }, [filter, industries, items, onFilterChange, taxonomyData]);

  return (
    <section className="research-visuals" aria-labelledby="research-visuals-heading">
      <div className="section-heading"><div><h2 id="research-visuals-heading">研究概览</h2><p>查看岗位分布与推进条件；点击任一图表可筛选下方岗位表。</p></div></div>
      <div className="research-chart-grid">
        <figure className="research-chart-panel"><figcaption><strong>推进状态</strong><span>区分可以申请、需要确认和暂不推进的机会。</span></figcaption><div className="research-chart" ref={taxonomyElement} role="img" aria-label="按推进状态统计的岗位数量" /></figure>
        <figure className="research-chart-panel"><figcaption><strong>各行业的推进状态</strong><span>查看不同领域的机会与待确认条件。</span></figcaption><div className="research-chart" ref={landscapeElement} role="img" aria-label="按行业分组的岗位推进状态" /></figure>
      </div>
    </section>
  );
}
