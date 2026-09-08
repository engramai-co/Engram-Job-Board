import { jobTrackerData } from "./data/opportunities";
import type { MixView, Opportunity, PortfolioItem, Stage } from "./types";

export const data = jobTrackerData;
export const portfolioStages = new Set<Stage>(["Applied", "OA", "Interviewing", "Final round", "Offer"]);

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
  if (Number.isNaN(value.getTime())) return "Not recorded";
  return new Intl.DateTimeFormat("en-GB", options).format(value);
}

export function jdEvidence(status: string, checkedAt: string) {
  if (status === "Unchecked" || !checkedAt) return `${status} · browser evidence not recorded`;
  return `${status} · checked ${formatDate(parseLocalDate(checkedAt), { day: "2-digit", month: "short", year: "numeric" })}`;
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

export function getPortfolioItems(): PortfolioItem[] {
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
      display: `${currency.format(yearOneCash ?? 0)} estimated first-year cash`,
      source: offer.source
    },
    application: {
      confirmedAt: "",
      evidence: offer.source,
      confirmationSubject: offer.status,
      roleMapping: offer.verified ? "User-marked verified offer; signing date not recorded." : "Not offer-verified."
    },
    nextStep: "Compare alternatives with this baseline across compensation, career trajectory, and work content."
  }] : [];
  return [
    ...signedBaseline,
    ...data.opportunities.filter((item) => portfolioStages.has(item.stage))
  ].sort((a, b) => {
    if (a.stage === "Offer" && b.stage !== "Offer") return -1;
    if (b.stage === "Offer" && a.stage !== "Offer") return 1;
    return new Date(b.application?.confirmedAt || 0).getTime() - new Date(a.application?.confirmedAt || 0).getTime();
  });
}

export function getResearchItems(): Opportunity[] {
  return data.opportunities.filter((item) => !portfolioStages.has(item.stage));
}

export function portfolioDimension(item: PortfolioItem, view: MixView): string {
  if (view === "status") return item.stage;
  if (view === "area") return item.mixArea || "Unknown";
  if (view === "role") return item.mixRole || item.category || "Unknown";
  return item.industry || "Unknown";
}

export function researchStatusClass(status: string) {
  if (status === "Needs validation") return "tag--warning";
  if (status === "High-upside reach") return "tag--stretch";
  if (status === "Not actionable") return "tag--negative";
  return "tag--muted";
}

export function stageClass(stage: Stage) {
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
