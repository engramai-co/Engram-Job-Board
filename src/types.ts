export type DashboardView = "applications" | "research";
export type MixView = "status" | "area" | "role" | "industry";
export type Stage = "Researching" | "Applied" | "OA" | "Interviewing" | "Final round" | "Offer";
export type ResearchStatus = "Applied" | "Needs validation" | "High-upside reach" | "Monitor opening" | "Deprioritized" | "Not actionable";
export type JDStatus = "Live" | "Evergreen" | "Closed" | "Unchecked";
export type Tone = "positive" | "warning" | "stretch" | "muted";

export interface Compensation {
  base: string | number | null;
  bonus: string | number | null;
  signOn: string | number | null;
  equity: string | number | null;
  firstYearCash: string | number | null;
  recurringCash: string | number | null;
  display: string;
  source: string;
  confidence: string;
  hurdle: string;
  hurdleLabel: string;
  verified: boolean;
}

export interface JD {
  url: string;
  status: JDStatus;
  checkedAt: string;
}

export interface Alignment {
  label: string;
  tone: Tone;
  evidence: string;
}

export interface ApplicationEvidence {
  confirmedAt: string;
  evidence: string;
  confirmationSubject: string;
  roleMapping: string;
}

export interface CultureEvidence {
  summary: string;
  confidence: string;
}

export interface Opportunity {
  id: string;
  company: string;
  role: string;
  stage: Stage;
  status: string;
  researchStatus: ResearchStatus;
  location: string;
  region: string;
  mixArea?: string | null;
  mixRole?: string;
  team: string;
  category: string;
  industry: string;
  geographyPriority: string;
  frontOffice: boolean | null;
  coreAi: boolean | null;
  alignment: Alignment;
  jd: JD;
  application?: ApplicationEvidence;
  compensation: Compensation;
  culture?: CultureEvidence;
  fitReason: string;
  eligibility: string;
  hardGap: string;
  nextStep: string;
}

export type OpportunityInput = Omit<
  Opportunity,
  "stage" | "status" | "geographyPriority" | "frontOffice" | "coreAi" | "jd"
> & {
  stage?: Stage;
  status?: string;
  geographyPriority?: string;
  frontOffice?: boolean | null;
  coreAi?: boolean | null;
  jd: Pick<JD, "url"> & Partial<Omit<JD, "url">>;
};

export interface RejectedRole {
  company: string;
  title: string;
  url: string;
  status: JDStatus;
  checkedAt: string;
  reason: string;
  replacement?: { title: string; url: string };
}

export interface NoQualifyingCompany {
  company: string;
  checkedAt: string;
  reason: string;
  inspectedJd?: { title: string; url: string; status: JDStatus };
}

export interface SecondaryOpportunity {
  company: string;
  role: string;
  location: string;
  team: string;
  fitReason: string;
  eligibility: string;
  hardGap: string;
  compensation: Compensation;
  nextStep: string;
  jd: JD;
}

export interface Interview {
  opportunityId: string;
  stage: string;
  date: string;
  status?: string;
}

export interface CalendarEvent {
  date: string;
  title: string;
  kind?: string;
}

export interface DashboardData {
  profile: { name: string; cycle: string; cycleOpened: string; currency: string };
  research: {
    asOf: string;
    lastReviewed: string;
    scope: string;
    sourceRule: string;
    excludedCompanies: string[];
    noQualifying: NoQualifyingCompany[];
    rejectedRoles: RejectedRole[];
    secondaryGeography: SecondaryOpportunity[];
  };
  signedOffer?: {
    status: string;
    company: string;
    role: string;
    officialTitle: string;
    source: string;
    base: number;
    projectedBonus: number;
    firstYearSignOn: number;
    equity: number | null;
    benefits: string | null;
    verified: boolean;
    location?: string;
    region?: string;
    mixArea?: string;
    mixRole?: string;
    team?: string;
    industry?: string;
  } | null;
  opportunities: Opportunity[];
  interviews: Interview[];
  events: CalendarEvent[];
  secondaryCriteria: { status: string; items: string[] };
}

export interface PortfolioItem {
  id: string;
  company: string;
  role: string;
  stage: Stage;
  researchStatus: ResearchStatus;
  location: string;
  region: string;
  mixArea?: string | null;
  mixRole?: string;
  team: string;
  category: string;
  industry: string;
  application?: ApplicationEvidence;
  compensation: Pick<Compensation, "display" | "source">;
  nextStep: string;
  jd?: JD;
}
