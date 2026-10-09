import { RefreshCw, CircleHelp } from "lucide-react";
import { safeExternalUrl } from "../lib";
import { researchFreshness } from "../research-freshness";
import type { JD } from "../types";

export function ResearchFreshness({ jd, today }: { jd: JD; today: string }) {
  const state = researchFreshness(jd, today);
  if (state.level === "recent") return null;
  const url = safeExternalUrl(jd.url);
  return <details className={"research-freshness is-" + state.level}>
    <summary>
      {state.level === "unknown" ? <CircleHelp size={14} aria-hidden="true"/> : <RefreshCw size={14} aria-hidden="true"/>}
      <span>{state.label}{state.days !== null && <span className="freshness-age"> · {state.days} 天未核验</span>}</span>
    </summary>
    <div><p>{state.detail}</p>{url && <a href={url} target="_blank" rel="noreferrer">重新查看原始 JD<span className="sr-only">（在新标签页打开）</span></a>}
      <p>仅提醒信息时效。编辑备注、重新评分或打开链接不会自动刷新核验日期。</p>
    </div>
  </details>;
}
