import { useEffect, useMemo, useRef } from "react";
import * as echarts from "echarts/core";
import { PieChart } from "echarts/charts";
import { GraphicComponent, LegendComponent, TitleComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { portfolioDimension } from "../lib";
import type { MixView, PortfolioItem } from "../types";

echarts.use([PieChart, GraphicComponent, LegendComponent, TitleComponent, TooltipComponent, CanvasRenderer]);

export interface ChartFilter {
  view: MixView;
  label: string;
}

const colors = ["#2f6a4f", "#b88935", "#79948a", "#b6543d", "#7d6b91", "#9ba477", "#577c9b", "#bd7184", "#94745b", "#3f8582"];
const viewCopy: Record<MixView, { label: string; title: string; description: string }> = {
  status: { label: "Status", title: "Application status", description: "Submitted applications, active processes, and offers." },
  area: { label: "Location", title: "Location", description: "One confirmed application office per record. Unselected offices stay Unknown." },
  role: { label: "Role", title: "Role family", description: "Role mix after research becomes an application." },
  industry: { label: "Industry", title: "Industry", description: "Industry mix across applications and offers." }
};

interface PortfolioChartProps {
  items: PortfolioItem[];
  view: MixView;
  selected: ChartFilter | null;
  onViewChange: (view: MixView) => void;
  onSliceSelect: (filter: ChartFilter | null) => void;
}

export function PortfolioChart({ items, view, selected, onViewChange, onSliceSelect }: PortfolioChartProps) {
  const chartElement = useRef<HTMLDivElement>(null);
  const seriesData = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((item) => {
      const key = portfolioDimension(item, view) || "Unknown";
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return Array.from(counts, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [items, view]);

  useEffect(() => {
    const element = chartElement.current;
    if (!element) return;
    const chart = echarts.init(element, undefined, { renderer: "canvas" });

    const render = () => {
      const compact = element.clientWidth < 720;
      const meta = viewCopy[view];
      chart.setOption({
        animationDuration: 520,
        animationDurationUpdate: 420,
        animationEasing: "cubicOut",
        animationEasingUpdate: "cubicOut",
        color: colors,
        tooltip: {
          trigger: "item",
          renderMode: "richText",
          confine: true,
          backgroundColor: "#17231c",
          borderWidth: 0,
          padding: [10, 12],
          textStyle: { color: "#fffef8", fontFamily: "Inter, ui-sans-serif, system-ui", fontSize: 12 },
          formatter: ({ name, value, percent }: { name: string; value: number; percent: number }) => `${name}\n${value} record${value === 1 ? "" : "s"} · ${percent}%`
        },
        title: {
          text: String(items.length),
          subtext: "TOTAL",
          left: compact ? "center" : "34%",
          top: compact ? "31%" : "42%",
          textAlign: "center",
          textStyle: { color: "#17231c", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: compact ? 38 : 50, fontWeight: 560 },
          subtextStyle: { color: "#657068", fontFamily: "Inter, ui-sans-serif, system-ui", fontSize: 10, fontWeight: 700, letterSpacing: 1 }
        },
        legend: {
          type: "scroll",
          orient: compact ? "horizontal" : "vertical",
          left: compact ? "center" : "68%",
          right: compact ? 12 : 18,
          top: compact ? "72%" : "center",
          bottom: compact ? 4 : undefined,
          itemWidth: 10,
          itemHeight: 10,
          itemGap: compact ? 13 : 16,
          selectedMode: true,
          textStyle: { color: "#657068", fontFamily: "Inter, ui-sans-serif, system-ui", fontSize: 12 },
          formatter: (name: string) => {
            const entry = seriesData.find((item) => item.name === name);
            return `${name}   ${entry?.value ?? 0}`;
          }
        },
        graphic: compact ? [] : [{
          type: "group",
          left: "68%",
          top: 62,
          children: [
            { type: "text", style: { text: meta.title, fill: "#17231c", font: "700 16px Inter, ui-sans-serif, system-ui" } },
            { type: "text", top: 26, style: { text: meta.description, fill: "#657068", width: 270, overflow: "break", lineHeight: 18, font: "12px Inter, ui-sans-serif, system-ui" } }
          ]
        }],
        series: [{
          name: meta.title,
          type: "pie",
          radius: compact ? ["42%", "64%"] : ["45%", "70%"],
          center: compact ? ["50%", "40%"] : ["34%", "52%"],
          minAngle: 4,
          selectedMode: "single",
          selectedOffset: 7,
          avoidLabelOverlap: true,
          itemStyle: { borderColor: "#f5f3eb", borderWidth: 2 },
          label: { show: false },
          emphasis: {
            scale: true,
            scaleSize: 7,
            itemStyle: { shadowBlur: 16, shadowOffsetY: 7, shadowColor: "rgba(23,35,28,0.18)" },
            label: { show: true, position: "center", formatter: "{b}\n{c} · {d}%", color: "#17231c", fontSize: 12, fontWeight: 700, lineHeight: 19 }
          },
          data: seriesData.map((item) => ({ ...item, selected: selected?.view === view && selected.label === item.name }))
        }]
      }, true);
    };

    render();
    chart.on("click", (params) => {
      if (params.componentType !== "series" || typeof params.name !== "string") return;
      const next = selected?.view === view && selected.label === params.name ? null : { view, label: params.name };
      onSliceSelect(next);
    });
    const resizeObserver = new ResizeObserver(() => { chart.resize(); render(); });
    resizeObserver.observe(element);
    return () => { resizeObserver.disconnect(); chart.dispose(); };
  }, [items, onSliceSelect, selected, seriesData, view]);

  return (
    <section className="mix-section" aria-labelledby="mix-heading">
      <div className="section-heading">
        <div><h2 id="mix-heading">Portfolio mix</h2><p>Click a slice to filter the tracker. Click legend items to hide or restore categories.</p></div>
        <div className="mix-note">Interactive portfolio</div>
      </div>
      <div className="mix-view-switch" role="group" aria-label="Portfolio mix view">
        {(Object.keys(viewCopy) as MixView[]).map((key) => (
          <button key={key} className={`mix-view-switch__button${view === key ? " is-selected" : ""}`} type="button" aria-pressed={view === key} onClick={() => onViewChange(key)}>{viewCopy[key].label}</button>
        ))}
      </div>
      <div ref={chartElement} className="echarts-portfolio" role="img" aria-label={`${viewCopy[view].title}: ${items.length} portfolio records`} />
    </section>
  );
}
