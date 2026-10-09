import type { DetailedAssessment, DetailedDimension, Opportunity } from "./types";

export type ScoreProfile = "project" | "full-time";
export type ResearchPool = ScoreProfile | "unconfirmed";

export const scoreProfiles: Record<ScoreProfile, {
  label: string;
  weights: Record<DetailedDimension, number>;
}> = {
  project: { label: "实践匹配分", weights: { content: 30, evidence: 45, growth: 15, platform: 10 } },
  "full-time": { label: "全职匹配分", weights: { content: 30, evidence: 25, growth: 25, platform: 20 } },
};

export const researchPools: { id: ResearchPool; label: string; description: string }[] = [
  { id: "project", label: "实习／兼职／项目", description: "包括全职实习、Part-time、Freelance 与志愿项目，更看重当前能力和实际交付。" },
  { id: "full-time", label: "全职 Full-time", description: "为后续全职申请准备，更看重长期方向与平台。入职时间可协调，申请截止日仍按各岗位查看。" },
  { id: "unconfirmed", label: "性质待确认", description: "JD 尚未确认工作性质，先保留原参考分；确认合同类型后归入对应组。" },
];

export function researchPool(item: Pick<Opportunity, "work">): ResearchPool {
  // Full-time internships stay with internships, regardless of weekly hours/start date.
  switch (item.work?.contract) {
    case "Full-time": return "full-time";
    case "Internship": case "Part-time": case "Freelance": case "Volunteer": return "project";
    default: return "unconfirmed";
  }
}

export const scoreDimensions: {
  key: DetailedDimension; label: string; short: string; weight: number; description: string;
  criteria: { key: string; label: string; weight: number; description: string }[];
}[] = [
  { key: "content", label: "工作内容匹配", short: "内容", weight: 30,
    description: "看实际日常职责，不因 title 对口就满分。",
    criteria: [
      { key: "duties", label: "日常主要职责", weight: 50, description: "与候选人主攻方向实际工作的重合程度，不凭职位名称判断。" },
      { key: "creative", label: "创作／制作参与度", weight: 30, description: "亲手创作、研究或交付的比重；仅协调素材不等同主创。" },
      { key: "direction", label: "方向偏好", weight: 20, description: "与候选人已确认职业目标的贴近程度；不重复奖励公司名气。" },
    ] },
  { key: "evidence", label: "能力与经历匹配", short: "能力", weight: 40,
    description: "按具体要求与材料证据核对，不将相邻经历当成全部满足。",
    criteria: [
      { key: "skills", label: "JD 核心技能", weight: 40, description: "工具、流程和专业领域的已支持覆盖；电影剪辑不自动证明 paid media 或音乐制作。" },
      { key: "projects", label: "同类项目经历", weight: 30, description: "行业、媒介、受众和交付物与既有项目的接近程度。" },
      { key: "level", label: "独立负责程度", weight: 20, description: "要求的责任范围与已有个人贡献是否匹配；不按 title 或学校延期推定。" },
      { key: "proof", label: "作品证据", weight: 10, description: "可对应的署名、工具和案例；作品未观看或结果未核验时不打满。" },
    ] },
  { key: "growth", label: "职业成长价值", short: "成长", weight: 20,
    description: "判断未来工作的增量价值，不以大公司名称代替培养证据。",
    criteria: [
      { key: "ownership", label: "创作 ownership", weight: 50, description: "岗位带来的创作、研究或制作责任，不是候选人已掌握的能力。" },
      { key: "trajectory", label: "后续职业路径", weight: 50, description: "具体工作对目标职业的可迁移价值，不保证晋升、转岗或转正。" },
    ] },
  { key: "platform", label: "公司平台偏好", short: "平台", weight: 10,
    description: "按公司规模、领域相关性和履历价值判断；品牌不等同团队文化。",
    criteria: [
      { key: "scale", label: "公司规模", weight: 60, description: "已知大型集团／全国网络／专业机构的规模偏好；规模未知时不推定。" },
      { key: "brand", label: "品牌与履历价值", weight: 40, description: "与目标领域有关的品牌识别和用户偏好，不代表录用概率。" },
    ] },
];

export function dimensionsForProfile(profile?: ScoreProfile) {
  return scoreDimensions.map(dimension => ({
    ...dimension,
    weight: profile ? scoreProfiles[profile].weights[dimension.key] : dimension.weight,
  }));
}

export interface ScoreRange { min: number; max: number; coverage: number }
export function dimensionScore(assessment: DetailedAssessment | undefined, key: DetailedDimension): ScoreRange | null {
  const dimension = scoreDimensions.find(d => d.key === key);
  const scores = assessment?.dimensions[key]?.criteria;
  if (!dimension || !scores) return null;
  let min = 0, max = 0, coverage = 0;
  for (const criterion of dimension.criteria) {
    const entry = scores[criterion.key];
    if (!entry || (entry.value !== null && (!Number.isFinite(entry.value) || entry.value < 0 || entry.value > 100))) return null;
    if (entry.value === null) { max += criterion.weight; continue; }
    min += entry.value * criterion.weight / 100;
    max += entry.value * criterion.weight / 100;
    coverage += criterion.weight;
  }
  return { min, max, coverage };
}
export function assessmentRange(assessment?: DetailedAssessment, profile?: ScoreProfile): ScoreRange | null {
  if (!assessment || assessment.version !== "evidence-100-v1") return null;
  let min = 0, max = 0, coverage = 0;
  for (const dimension of dimensionsForProfile(profile)) {
    const score = dimensionScore(assessment, dimension.key);
    if (!score) return null;
    min += score.min * dimension.weight / 100;
    max += score.max * dimension.weight / 100;
    coverage += score.coverage * dimension.weight / 100;
  }
  return { min, max, coverage };
}
export function scoreLabel(score: ScoreRange | null): string {
  if (!score) return "—";
  // Arithmetic such as 78 * .4 + 78 * .3 can land just below an integer.
  return score.coverage === 100 ? String(Math.floor(score.min + 1e-9)) : `${Math.floor(score.min + 1e-9)}–${Math.ceil(score.max - 1e-9)}`;
}
export function assessmentTotal(assessment?: DetailedAssessment, profile?: ScoreProfile): number | null {
  const score = assessmentRange(assessment, profile);
  return score ? Math.floor(score.min + 1e-9) : null;
}
export function rankOpportunities(items: Opportunity[], profile?: ScoreProfile) {
  // Freshness, availability, eligibility and application outcome never affect this sort.
  const sorted = items.map(item => {
    const range = assessmentRange(item.detailedAssessment, profile);
    return { item, range, total: range ? Math.floor(range.min + 1e-9) : null };
  }).sort((a, b) => (b.total ?? -1) - (a.total ?? -1) || a.item.company.localeCompare(b.item.company, "en") || a.item.id.localeCompare(b.item.id, "en"));
  let rank: number | null = null;
  return sorted.map((entry, index) => {
    if (entry.total !== null && (index === 0 || entry.total !== sorted[index - 1].total)) rank = index + 1;
    return { ...entry, rank: entry.total === null ? null : rank };
  });
}
