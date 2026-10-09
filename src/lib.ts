import { jobTrackerData } from "./data/opportunities";
import type { ContractType, JD, MixView, Opportunity, PortfolioItem, Stage, TrackFilter, WorkTerms } from "./types";

export const data = jobTrackerData;

/** Display labels only: persisted IDs and filter values stay stable. */
export function displayLabel(value: string): string {
  return ({
    "Researching": "研究中", "Unsubmitted research": "尚未申请", "Applied": "已申请",
    "OA": "在线测评", "Interviewing": "面试中", "Final round": "终面", "Offer": "Offer",
    "Rejected": "已拒绝", "Withdrawn": "已撤回", "Dropped": "已放弃", "Waitlist": "候补中",
    "Live": "开放中", "Evergreen": "长期招聘", "Closed": "已关闭", "Unchecked": "未核验",
    "Availability unclear": "是否仍招待确认", "Not recorded": "未记录", "Unknown": "待确认",
    "Not stated": "未公布", "Not specified": "未说明", "Contract unconfirmed": "工作性质待确认",
    "Primary": "优先地区", "Secondary": "其他地区",
    "Freelance": "Freelance", "Internship": "实习", "Part-time": "兼职", "Full-time": "全职", "Volunteer": "志愿者",
    "On-site": "现场办公", "Hybrid": "混合办公", "Remote": "远程",
    "hour": "小时", "day": "天", "project": "项目", "month": "月", "year": "年",
    "Production assistance": "制作协助", "Social media & marketing": "社媒与市场营销",
    "Advertising": "广告创意", "Video editing & photography": "视频剪辑与摄影",
    "AI filmmaking & creative production": "AI 影像与创意制作",
    "Programme production": "节目制作", "Product management": "产品管理",
    "Strong evidence": "经历匹配较强", "Adjacent": "经验可迁移", "Explore": "探索方向",
    "Active focus": "主攻方向", "Search paused": "暂停搜索",
    "Advertising technology": "广告科技", "Technology & commerce": "科技与电商",
    "Events & production": "活动与制作", "Fashion": "时尚",
    "Film & media": "影视与传媒", "Post-production & VFX": "后期与 VFX",
    "Technology & advertising": "科技与广告", "Financial services": "金融服务",
    "Retail": "零售", "Consulting": "咨询", "Creative industries": "创意产业",
    "London": "伦敦", "United Kingdom": "英国", "Scheduled": "已安排"
  } as Record<string, string>)[value] || value;
}

export const portfolioStages = new Set<Stage>(["Applied", "OA", "Interviewing", "Final round", "Offer", "Rejected", "Waitlist", "Withdrawn"]);

export const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: data.profile.currency,
  maximumFractionDigits: 0
});

export const yearOneCash = data.signedOffer ? data.signedOffer.base + data.signedOffer.projectedBonus + data.signedOffer.firstYearSignOn : null;
export const recurringCash = data.signedOffer ? data.signedOffer.base + data.signedOffer.projectedBonus : null;

export function parseLocalDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDate(value: Date, options: Intl.DateTimeFormatOptions) {
  if (Number.isNaN(value.getTime())) return "未记录";
  return new Intl.DateTimeFormat("zh-CN", options).format(value);
}

export function jdEvidence(status: string, checkedAt: string, verification?: JD["verification"]) {
  if (status === "Unchecked" || !checkedAt) return `${displayLabel(status)} · 尚无浏览器核验记录`;
  const method = verification === "Browser" ? "浏览器核验" : verification === "Full text" ? "网页全文核验" : verification === "Historical index" ? "历史索引 / 页面状态核对" : verification === "Unverified" ? "检索于，未核验正文" : "核验方式未记录";
  return `${displayLabel(status)} · ${method} ${formatDate(parseLocalDate(checkedAt), { day: "2-digit", month: "short", year: "numeric" })}`;
}

export function jdSourceLabel(jd?: JD) {
  if (!jd?.url) return "具体 JD 待补";
  const source = jd.source === "User" ? "手动记录 · 尚未核验" : jd.source === "LinkedIn" ? "LinkedIn JD" : jd.source === "Indeed" ? "Indeed JD" : jd.source === "Employer" ? "官方 JD" : "JD 来源待核验";
  return source + (jd.match === "Unresolved" ? " · 对应关系待确认" : jd.match === "Probable" ? " · 按公司 / 职位匹配" : "");
}

export function safeExternalUrl(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function getPortfolioItems(opportunities: Opportunity[] = data.opportunities): PortfolioItem[] {
  const offer = data.signedOffer;
  const signedBaseline: PortfolioItem[] = offer ? [{
    id: "signed-offer-baseline",
    company: offer.company,
    role: `${offer.officialTitle} (${offer.role})`,
    stage: "Offer",
    researchStatus: "Applied",
    location: offer.location || "Not recorded",
    region: offer.region || "Not recorded",
    mixArea: offer.mixArea || null,
    mixRole: offer.mixRole || offer.role,
    team: offer.team || "Not recorded",
    category: offer.role,
    industry: offer.industry || "Unknown",
    compensation: {
      display: `${currency.format(yearOneCash ?? 0)} 预估首年现金`,
      source: offer.source
    },
    application: {
      confirmedAt: "",
      evidence: offer.source,
      confirmationSubject: offer.status,
      roleMapping: offer.verified ? "用户确认已核验 Offer；签署日期未记录。" : "尚无 Offer 验证。"
    },
    nextStep: "以此为基准，结合薪资、职业发展和工作内容比较其他机会。"
  }] : [];
  return [
    ...signedBaseline,
    ...opportunities.filter((item) => portfolioStages.has(item.stage))
  ].sort((a, b) => {
    if (a.stage === "Offer" && b.stage !== "Offer") return -1;
    if (b.stage === "Offer" && a.stage !== "Offer") return 1;
    return new Date(b.application?.confirmedAt || b.application?.recordedAt || 0).getTime() - new Date(a.application?.confirmedAt || a.application?.recordedAt || 0).getTime();
  });
}

export function getResearchItems(opportunities: Opportunity[] = data.opportunities): Opportunity[] {
  return opportunities.filter((item) => !portfolioStages.has(item.stage));
}

export function portfolioDimension(item: PortfolioItem, view: MixView): string {
  if (view === "status") return displayLabel(item.stage);
  if (view === "area") return displayLabel(item.mixArea || "Unknown");
  if (view === "role") return displayLabel(item.mixRole || item.category || "Unknown");
  if (view === "contract") return displayLabel(item.work?.contract || "Not recorded");
  if (view === "timing") return trackLabel(item.work?.track);
  return displayLabel(item.industry || "Unknown");
}

export function trackLabel(track?: WorkTerms["track"]) {
  return track === "now" ? "近期可入职" : track === "summer-2027" ? "2027 夏季" : "入职时间待确认";
}

export function filterCareerItems<T extends { work?: WorkTerms; mixRole?: string; category: string }>(
  items: T[], track: TrackFilter, family = "all", contract: ContractType | "all" = "all"
): T[] {
  return items.filter((item) =>
    (track === "all" || item.work?.track === track) &&
    (family === "all" || (item.mixRole || item.category) === family) &&
    (contract === "all" || item.work?.contract === contract)
  );
}

export function researchStatusClass(status: string) {
  if (status === "Ready to apply") return "tag--positive";
  if (status === "Needs validation") return "tag--warning";
  if (status === "High-upside reach") return "tag--stretch";
  if (status === "Not actionable") return "tag--negative";
  if (status === "Rejected") return "tag--negative";
  return "tag--muted";
}

export function researchDecisionLabel(status: string) {
  return ({ "Applied": "已申请", "Rejected": "已拒绝", "Ready to apply": "可准备申请", "Needs validation": "先确认条件", "High-upside reach": "需补作品或技能", "Monitor opening": "等待开放", Deprioritized: "低优先级", "Not actionable": "资格不符或已关闭" } as Record<string, string>)[status] || status;
}

export function stageClass(stage: Stage) {
  if (stage === "Rejected") return "tag--negative";
  if (stage === "Offer") return "tag--positive";
  if (["Applied", "OA", "Interviewing", "Final round"].includes(stage)) return "tag--warning";
  return "";
}

export function hurdleClass(hurdle: string) {
  if (hurdle === "clear") return "tag--positive";
  if (hurdle === "likely") return "tag--warning";
  return "tag--muted";
}

export function alignmentClass(tone: string) {
  if (tone === "positive") return "tag--positive";
  if (tone === "warning") return "tag--warning";
  if (tone === "stretch") return "tag--stretch";
  return "tag--muted";
}
