export type DashboardView = "applications" | "research";
export type MixView = "status" | "area" | "role" | "industry" | "contract" | "timing";
export type SearchTrack = "now" | "summer-2027";
export type TrackFilter = SearchTrack | "all";
export type ContractType = "Freelance" | "Internship" | "Part-time" | "Full-time" | "Volunteer";
export interface WorkTerms {
  track: SearchTrack | null;
  contract: ContractType | null;
  start: string;
  hours: string;
  duration: string;
  workplace: "On-site" | "Hybrid" | "Remote" | "Not stated";
  travel: string;
  payUnit: "hour" | "day" | "project" | "month" | "year" | "Not stated";
  portfolio: string;
  deadline: string | null;
}
export interface SearchPlan {
  headline: string;
  education: string;
  location: string;
  preferences: string[];
  tracks: { id: SearchTrack; title: string; description: string; contracts: ContractType[]; caveat: string }[];
  families: { id: string; label: string; searchStatus: "Active focus" | "Search paused"; fit: "Strong evidence" | "Adjacent" | "Explore"; evidence: string; keywords: string[]; nextStep: string }[];
  checks: string[];
  sources: { title: string; note: string }[];
}
export type Stage = "Researching" | "Applied" | "OA" | "Interviewing" | "Final round" | "Offer" | "Rejected" | "Waitlist" | "Withdrawn";
export type ResearchStatus = "Applied" | "Rejected" | "Ready to apply" | "Needs validation" | "High-upside reach" | "Monitor opening" | "Deprioritized" | "Not actionable";
export type JDStatus = "Live" | "Evergreen" | "Closed" | "Unchecked" | "Availability unclear";
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
  source?: "Employer" | "LinkedIn" | "Indeed" | "User";
  verification?: "Browser" | "Full text" | "Historical index" | "Unverified";
  match?: "Confirmed" | "Probable" | "Unresolved";
  note?: string;
  references?: { label: string; url: string; checkedAt: string }[];
}

export interface DiscoveryEvidence {
  source: "LinkedIn";
  url: string;
  checkedAt: string;
  postedLabel: string;
  postingKind: "Posted" | "Reposted";
  officialPostedAt?: string;
  note: string;
}

export interface Alignment {
  label: string;
  tone: Tone;
  evidence: string;
}

export interface ApplicationEvidence {
  source?: "manual" | "user" | "screenshot";
  recordedAt?: string;
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
  discovery?: DiscoveryEvidence;
  application?: ApplicationEvidence;
  compensation: Compensation;
  culture?: CultureEvidence;
  fitReason: string;
  eligibility: string;
  hardGap: string;
  nextStep: string;
  work?: WorkTerms;
  assessment?: OpportunityAssessment;
  detailedAssessment?: DetailedAssessment;
  personalNotes?: string;
  appliedDate?: string;
  followUp?: string;
  contact?: string;
  archived?: boolean;
  userEdited?: boolean;
}

export type ScoreDimension = "content" | "evidence" | "feasibility" | "platform";
export interface OpportunityAssessment {
  assessedAt: string;
  scores: Record<ScoreDimension, { value: 1 | 2 | 3 | 4 | 5; reason: string }>;
  reservation: string;
}

/** Legacy star assessments remain history; they are not converted into points. */
export type DetailedDimension = "content" | "evidence" | "growth" | "platform";
export interface DetailedAssessment {
  version: "evidence-100-v1";
  assessedAt: string;
  dimensions: Record<DetailedDimension, {
    reason: string;
    criteria: Record<string, { value: number | null; reason: string }>;
  }>;
  reservation: string;
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
  searchPlan?: SearchPlan;
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
  work?: WorkTerms;
  personalNotes?: string;
  appliedDate?: string;
  followUp?: string;
  contact?: string;
}
