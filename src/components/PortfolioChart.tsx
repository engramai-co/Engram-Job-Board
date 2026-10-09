import { useEffect, useMemo, useRef } from "react";
import { SegmentedControl } from '@mantine/core';
import * as echarts from "echarts/core";
import { PieChart } from "echarts/charts";
import { GraphicComponent, LegendComponent, TitleComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { data, portfolioDimension } from "../lib";
import type { MixView, PortfolioItem } from "../types";

echarts.use([PieChart, GraphicComponent, LegendComponent, TitleComponent, TooltipComponent, CanvasRenderer]);

export interface ChartFilter {
  view: MixView;
  label: string;
}

const colors = ["#2f6a4f", "#b88935", "#79948a", "#b6543d", "#7d6b91", "#9ba477", "#577c9b", "#bd7184", "#94745b", "#3f8582"];
const viewCopy: Record<MixView, { label: string; title: string; description: string }> = {
  status: { label: "状态", title: "申请状态", description: "仅统计已提交申请、进行中的流程与 Offer。" },
  area: { label: "地点", title: "申请地点", description: "每条记录对应一个已确认的申请地点；未选定则标为待确认。" },
  role: { label: "职位", title: "职位方向", description: "按已申请岗位的主要职责归类。" },
  industry: { label: "行业", title: "行业分布", description: "已提交申请和 Offer 所在的行业。" },
  contract: { label: "工作性质", title: "工作性质", description: "分别统计 Freelance、实习、兼职、全职和志愿者；报酬单独记录。" },
  timing: { label: "入职时间", title: "入职时间", description: "仅按 JD 已明确的时间分类；未知日期保留为待确认。" }
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
          formatter: ({ name, value, percent }: { name: string; value: number; percent: number }) => `${name}\n${value} 条记录 · ${percent}%`
        },
        title: {
          text: String(items.length),
          subtext: "总计",
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
        <div><h2 id="mix-heading">申请概览</h2><p>点击扇区可筛选下方申请表；点击图例可隐藏或显示分类。</p></div>
        <div className="mix-note">仅统计真实申请</div>
      </div>
      <div className="ui-chart-switch"><SegmentedControl aria-label="申请概览统计维度" value={view} onChange={v => onViewChange(v as MixView)} data={(Object.keys(viewCopy) as MixView[]).filter(key => data.searchPlan || !["contract", "timing"].includes(key)).map(key => ({value:key,label:viewCopy[key].label}))}/></div>
      {items.length ? <div ref={chartElement} className="echarts-portfolio" role="img" aria-label={`${viewCopy[view].title}: ${items.length} 条申请记录`} /> : <div className="career-empty-chart"><strong>当前范围还没有申请记录</strong><p>在岗位研究中标记已申请后，这里会自动生成图表。未申请岗位不计入统计。</p><a href="#research">查看岗位研究 <span aria-hidden="true">→</span></a></div>}
    </section>
  );
}
