import type { ContractType, DashboardData, Opportunity, Stage } from "./types";

export const stages: Stage[] = ["Researching", "Applied", "OA", "Interviewing", "Final round", "Offer", "Waitlist", "Rejected", "Withdrawn"];
export const contracts: ContractType[] = ["Full-time", "Part-time", "Internship", "Freelance", "Volunteer"];
export const results = ["待进行", "待反馈", "通过", "未通过", "已取消"] as const;
export const eventResults = ["待进行", "已报名", "已参加", "已取消"] as const;
export type EntryKind = "job" | "interview" | "event";
export interface JobFields {
  company: string; role: string; url: string; location: string; category: string; industry: string;
  contract: ContractType | ""; stage: Stage; appliedDate: string; notes: string; nextStep: string;
  followUp: string; contact: string; deadline: string;
}
export interface ScheduleFields {
  jobId: string; title: string; company: string; date: string; time: string; timeZone: string;
  duration: number; location: string; url: string; notes: string; result: typeof results[number] | typeof eventResults[number];
}
export interface Entry<T = JobFields | ScheduleFields> {
  id: string; kind: EntryKind; payload: T; archived: boolean; revision: number; updatedAt: string;
}
export type JobEntry = Entry<JobFields>;
export type ScheduleEntry = Entry<ScheduleFields>;
export function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}
export function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T12:00:00Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0,10) === value && value >= "2000-01-01" && value <= "2100-12-31";
}
export function jobFields(job?: Opportunity): JobFields {
  return {company:job?.company || "", role:job?.role || "",url:job?.jd.url || "",location:job?.location || "",
    category:job?.category || "",industry:job?.industry || "",contract:job?.work?.contract || "",
    stage:job?.stage || "Researching",appliedDate:job?.appliedDate ?? "",notes:job?.personalNotes || "",nextStep:job?.nextStep || "",
    followUp:job?.followUp || "", contact:job?.contact || "",deadline:job?.work?.deadline || ""};
}
export function scheduleFields(jobId = "", date = dateKey()): ScheduleFields {
  return {jobId, title:"",company:"",date,time:"",timeZone:"Europe/London",duration:30,location:"",url:"",notes:"",result:"待进行"};
}

/** Preserve pre-interactive schedule data; edits overlay these virtual revision-zero entries. */
export function sourceSchedules(data: Pick<DashboardData, "interviews" | "events" | "opportunities">): ScheduleEntry[] {
  const idFor = (kind: string, identity: string) => {
    let hash = 2166136261;
    for (const c of identity) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619);
    return "source-" + kind + "-" + (hash >>> 0).toString(16);
  };
  const entries: ScheduleEntry[] = [];
  for (const interview of data.interviews ?? []) {
    if (!validDate(interview.date)) continue;
    const job = data.opportunities.find(item => item.id === interview.opportunityId);
    if (!job) continue;
    entries.push({id:idFor("interview", JSON.stringify([job.id, interview.date, interview.stage])), kind:"interview", archived:false, revision:0, updatedAt:interview.date+"T12:00:00Z",
      payload:{...scheduleFields(job.id,interview.date),title:interview.stage,company:job.company,notes:interview.status || ""}});
  }
  for (const event of data.events ?? []) {
    if (!validDate(event.date)) continue;
    entries.push({id:idFor("event",JSON.stringify([event.date,event.title])),kind:"event",archived:false,revision:0,updatedAt:event.date+"T12:00:00Z",
      payload:{...scheduleFields("",event.date),title:event.title,notes:event.kind || ""}});
  }
  return [...new Map(entries.map(entry => [entry.id,entry])).values()];
}

export function mergeWorkspace(source: Opportunity[], entries: Entry[]): Opportunity[] {
  const jobs = new Map(source.map(job => [job.id, job]));
  for (const entry of entries.filter(entry => entry.kind === "job") as JobEntry[]) {
    const p = entry.payload;
    const original = jobs.get(entry.id);
    const changedJD = !original || original.jd.url !== p.url;
    const fallback: Opportunity = {
      id:entry.id,company:p.company,role:p.role,stage:p.stage,status:"手动记录",researchStatus:"Needs validation",
      location:p.location,region:"Not recorded",team:"尚未记录",category:p.category,industry:p.industry,geographyPriority:"Primary",
      frontOffice:null,coreAi:null,alignment:{label:"待研究",tone:"muted",evidence:"用户新增，尚未研究。"},
      jd:{url:p.url,status:"Unchecked",checkedAt:"",source:"User",verification:"Unverified"},
      compensation:{base:null,bonus:null,signOn:null,equity:null,firstYearCash:null,recurringCash:null,display:"薪资待补充",source:"手动记录，尚未核验",confidence:"待核验",hurdle:"",hurdleLabel:"",verified:false},
      fitReason:"手动新增岗位，尚未完成 JD 研究与评分。",eligibility:"待核验",hardGap:"待核验",nextStep:p.nextStep,
    };
    const job = original || fallback;
    jobs.set(entry.id, {...job,company:p.company,role:p.role,location:p.location,mixArea:p.location === job.location ? job.mixArea : p.location,
      category:p.category,mixRole:p.category === job.category ? job.mixRole : p.category,industry:p.industry,
      stage:p.stage, researchStatus:p.stage === "Researching" ? (job.researchStatus === "Applied" || job.researchStatus === "Rejected" ? "Needs validation" : job.researchStatus) : p.stage === "Rejected" ? "Rejected" : "Applied",
      status:"用户更新进度", appliedDate:p.appliedDate,personalNotes:p.notes,nextStep:p.nextStep,followUp:p.followUp,contact:p.contact,
      archived:entry.archived,userEdited:true,
      jd:changedJD ? {...fallback.jd,note:original?"用户修改的 JD 链接；原始研究依据不会自动重新核验。":"用户手动新增，JD 与资格尚未核验。"} : job.jd,
      detailedAssessment: changedJD || p.role !== job.role || p.company !== job.company ? undefined : job.detailedAssessment,
      work:{track:null,start:"入职日期待确认",hours:"工时待确认",duration:"期限待确认",workplace:"Not stated",travel:"外勤要求待确认",payUnit:"Not stated",portfolio:"待确认",...job.work,contract:p.contract || null,deadline:p.deadline || null},
      application:job.application || (p.stage !== "Researching" ? {source:"manual",confirmedAt:"",recordedAt:entry.updatedAt.slice(0,10),evidence:"用户在看板中记录申请进度；未核验邮件。",confirmationSubject:"",roleMapping:"申请日期由用户单独填写，登记时间不等于提交时间。"} : undefined),
    });
  }
  return [...jobs.values()];
}
