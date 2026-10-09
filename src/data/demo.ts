import type { Compensation, DashboardData, DetailedAssessment, Opportunity } from "../types";
import { scoreDimensions } from "../ranking";

/** Illustrative scores only: not an assessment of a real person or employer. */
function sampleAssessment(values: number[]): DetailedAssessment {
  return { version: "evidence-100-v1", assessedAt: "2026-08-20", reservation: "虚构评分，仅用于演示分组、权重和详情，不代表真实推荐。",
    dimensions: Object.fromEntries(scoreDimensions.map((d, i) => [d.key, {reason: "Fictional scoring example",
      criteria: Object.fromEntries(d.criteria.map(c => [c.key, {value: values[i], reason: "Synthetic example; replace with specific JD and candidate evidence."}]))}])) as DetailedAssessment["dimensions"] };
}

/** Entirely fictional UI fixtures. These are not real openings, applications, or pay estimates. */
const unverifiedCompensation: Compensation = {
  base: null,
  bonus: null,
  signOn: null,
  equity: null,
  firstYearCash: null,
  recurringCash: null,
  display: "Not researched",
  source: "Fictional example; no compensation evidence",
  confidence: "Unverified",
  hurdle: "unknown",
  hurdleLabel: "Not assessed",
  verified: false
};

function example(input: Pick<Opportunity, "id" | "company" | "role"> & Partial<Opportunity>): Opportunity {
  return {
    stage: "Researching",
    status: "Fictional example",
    researchStatus: "Needs validation",
    location: "Not recorded",
    region: "Not recorded",
    mixArea: null,
    mixRole: "AI / Research Engineering",
    team: "Not verified",
    category: "AI / Research Engineering",
    industry: "AI research",
    geographyPriority: "Not assessed",
    frontOffice: null,
    coreAi: null,
    alignment: { label: "Unverified", tone: "muted", evidence: "Demonstration only. Read a real official JD before assessing the mandate." },
    jd: { url: "", status: "Unchecked", checkedAt: "" },
    compensation: { ...unverifiedCompensation },
    fitReason: "Illustrates how to record evidence-backed fit; no real candidate has been assessed.",
    eligibility: "Degree, experience, and start-date requirements need an official source.",
    hardGap: "Evidence has not been collected.",
    nextStep: "Replace this example with a specific official JD and your own diligence.",
    work: {track: null, contract: null, start: "Not recorded", hours: "Not recorded", duration: "Not recorded", workplace: "Not stated", travel: "Not recorded", payUnit: "Not stated", portfolio: "Not recorded", deadline: null},
    ...input
  };
}

const syntheticConfirmation = {
  confirmedAt: "2026-08-18T12:00:00Z",
  evidence: "Fictional application receipt for demonstration",
  confirmationSubject: "Sample acknowledgement — not a real submission",
  roleMapping: "Example mapping only; no mailbox was accessed."
};

export const demoData: DashboardData = {
  profile: { name: "Demo workspace", cycle: "2026 demo", cycleOpened: "2026-08-01", currency: "USD" },
  research: {
    asOf: "2026-08-20",
    lastReviewed: "2026-08-20",
    scope: "Illustrative research only. Configure your own role, geography, and decision criteria.",
    sourceRule: "A real research record needs a specific official JD and dated browser evidence. All sample JDs are unchecked.",
    excludedCompanies: [],
    noQualifying: [],
    rejectedRoles: [],
    secondaryGeography: []
  },
  signedOffer: {
    status: "Fictional offer example",
    company: "Demo Cedar",
    role: "Product engineering",
    officialTitle: "Product Engineer",
    source: "Synthetic terms for UI demonstration; not a verified offer",
    base: 90000,
    projectedBonus: 12000,
    firstYearSignOn: 8000,
    equity: null,
    benefits: null,
    verified: false,
    location: "London",
    region: "United Kingdom",
    mixArea: "London",
    mixRole: "Software Engineering",
    team: "Demo product team",
    industry: "Technology"
  },
  opportunities: [
    example({
      id: "demo-aurora-applied", company: "Demo Aurora", role: "Research Engineer",
      stage: "Applied", researchStatus: "Applied", location: "London", region: "United Kingdom", mixArea: "London",
      application: syntheticConfirmation,
      nextStep: "Example only: a submitted application awaiting a response."
    }),
    example({
      id: "demo-harbor-interview", company: "Demo Harbor", role: "Quantitative Researcher",
      stage: "Interviewing", researchStatus: "Applied", location: "Singapore", region: "Singapore", mixArea: "Singapore",
      mixRole: "Quant Research", category: "Quant Research", industry: "Systematic investing",
      application: { ...syntheticConfirmation, confirmedAt: "2026-08-15T10:00:00Z" },
      nextStep: "Example only: prepare for a research discussion."
    }),
    example({
      id: "demo-orbit-applied", company: "Demo Orbit", role: "Applied ML Engineer",
      stage: "Applied", researchStatus: "Applied", location: "Office not selected; JD spans multiple locations", region: "Not recorded",
      application: { ...syntheticConfirmation, confirmedAt: "2026-08-12T09:00:00Z" },
      nextStep: "Confirm the application office before assigning a chart location."
    }),
    example({
      id: "demo-aster-validation", company: "Demo Aster", role: "Research Engineer, Evaluation",
      location: "London / Singapore", region: "Multiple regions", mixArea: null,
      nextStep: "Verify the exact JD, team mandate, and office availability."
    }),
    example({
      id: "demo-meridian-reach", company: "Demo Meridian", role: "Quantitative Researcher",
      researchStatus: "High-upside reach", mixRole: "Quant Research", category: "Quant Research", industry: "Systematic investing",
      location: "Hong Kong", region: "Hong Kong", mixArea: "Hong Kong",
      hardGap: "Example skill gap: research ownership and empirical validation need evidence."
    }),
    example({
      id: "demo-lantern-monitor", company: "Demo Lantern", role: "ML Research Engineer",
      researchStatus: "Monitor opening", location: "London", region: "United Kingdom", mixArea: "London",
      nextStep: "Example only: find a qualifying official opening before taking action."
    }),
    example({
      id: "demo-grove-deprioritized", company: "Demo Grove", role: "Software Engineer",
      researchStatus: "Deprioritized", mixRole: "Software Engineering", category: "Software Engineering", industry: "Technology",
      fitReason: "Example decision: limited improvement over the candidate's own baseline."
    }),
    example({
      id: "demo-summit-gated", company: "Demo Summit", role: "Research Scientist",
      researchStatus: "Needs validation", hardGap: "Example requirement gap: qualification needs confirmation; advisory only.",
      nextStep: "Keep the uncertainty visible; the user decides whether to pursue this role."
    })
  ],
  interviews: [{ opportunityId: "demo-harbor-interview", stage: "Sample research discussion", date: "2026-08-26", status: "Fictional" }],
  events: [],
  secondaryCriteria: { status: "Customize locally", items: ["Work content", "Career trajectory", "Compensation quality", "Geography and lifestyle"] }
};

const sampleContracts = ["Full-time", "Full-time", "Internship", "Internship", "Full-time", "Part-time", "Freelance", null] as const;
const sampleScores = [[78,72,80,70],[75,70,85,80],[84,78,70,75],[82,76,70,65],[76,60,88,90],[68,65,58,75],[55,50,65,45]];
demoData.opportunities = demoData.opportunities.map((item, index) => ({
  ...item, work: {...item.work!, contract: sampleContracts[index]},
  detailedAssessment: sampleScores[index] ? sampleAssessment(sampleScores[index]) : undefined
}));

export default demoData;
