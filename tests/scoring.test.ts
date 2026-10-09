import { test } from "node:test";
import assert from "node:assert/strict";
import { assessmentRange, dimensionScore, dimensionsForProfile, rankOpportunities, researchPool, scoreDimensions, scoreLabel, scoreProfiles, type ScoreProfile } from "../src/ranking.ts";
import { londonDate, researchFreshness } from "../src/research-freshness.ts";
import { jobFields, mergeWorkspace } from "../src/tracker-model.ts";
import type { DetailedAssessment, JD, Opportunity } from "../src/types.ts";

function assessment(value: number | null): DetailedAssessment {
  return { version: "evidence-100-v1", assessedAt: "2026-10-05", reservation: "条件仅供手动判断", dimensions: Object.fromEntries(scoreDimensions.map(d => [d.key, { reason: "测试依据", criteria: Object.fromEntries(d.criteria.map(c => [c.key, { value, reason: "测试依据" }])) }])) as DetailedAssessment["dimensions"] };
}
const jd: JD = { url: "https://example.com/job", status: "Live", source: "Employer", verification: "Browser", checkedAt: "2026-10-01" };
const job = { id: "test", company: "Studio", role: "Video Editor", location: "London", category: "Video editing", stage: "Researching", researchStatus: "Needs validation", jd, detailedAssessment: assessment(75) } as Opportunity;

test("contract groups preserve full-time internships, volunteers and genuinely unknown contracts", () => {
  const classified = (contract: NonNullable<Opportunity['work']>['contract'], hours = "40 hours", track: NonNullable<Opportunity['work']>['track'] = "now") => researchPool({work:{contract,hours,track} as NonNullable<Opportunity['work']>});
  for (const contract of ["Internship", "Freelance", "Part-time", "Volunteer"] as const) assert.equal(classified(contract), "project");
  assert.equal(classified("Internship", "Full-time", "summer-2027"), "project");
  assert.equal(classified("Full-time", "Not stated", "now"), "full-time");
  assert.equal(classified(null, "Full-time"), "unconfirmed");
  assert.equal(researchPool({}), "unconfirmed");
});

test("two preference profiles reweight the same evidence without inflating endpoints or mutating it", () => {
  const a = assessment(0);
  for (const [key,value] of Object.entries({content:80,evidence:90,growth:60,platform:100}))
    for (const entry of Object.values(a.dimensions[key as keyof typeof a.dimensions].criteria)) entry.value = value;
  const before = structuredClone(a);
  assert.equal(assessmentRange(a,"project")?.min,83.5);
  assert.equal(assessmentRange(a,"full-time")?.min,81.5);
  assert.deepEqual(a,before);
  for (const profile of Object.keys(scoreProfiles) as ScoreProfile[]) {
    assert.equal(dimensionsForProfile(profile).reduce((sum,d) => sum + d.weight,0),100);
    for (const value of [0,75,100]) assert.deepEqual(assessmentRange(assessment(value),profile),{min:value,max:value,coverage:100});
  }
});

test("short-term capability and full-time career value produce independent within-group rankings", () => {
  const make = (id:string,values:number[]) => {
    const a=assessment(0);
    scoreDimensions.forEach((d,i) => Object.values(a.dimensions[d.key].criteria).forEach(entry => {entry.value=values[i];}));
    return {...job,id,detailedAssessment:a};
  };
  const immediate=make("ready-delivery",[80,95,55,50]), career=make("career-value",[80,70,85,100]);
  assert.equal(rankOpportunities([immediate,career],"project")[0].item.id,"ready-delivery");
  assert.equal(rankOpportunities([immediate,career],"full-time")[0].item.id,"career-value");
  assert.equal(rankOpportunities([immediate],"project")[0].rank,1);
  assert.equal(rankOpportunities([career],"full-time")[0].rank,1);
});

test("unknown evidence keeps honest bounds under both profiles; changes in contract do not erase evidence", () => {
  const a=assessment(75); a.dimensions.platform.criteria.brand.value=null;
  assert.equal(assessmentRange(a,"project")?.coverage,96);
  assert.equal(assessmentRange(a,"full-time")?.coverage,92);
  const original={...job,detailedAssessment:a};
  const entry={id:job.id,kind:"job" as const,payload:{...jobFields(original),contract:"Full-time" as const},archived:false,revision:1,updatedAt:"2026-10-07T12:00:00Z"};
  const merged=mergeWorkspace([original],[entry])[0];
  assert.equal(researchPool(merged),"full-time");
  assert.deepEqual(merged.detailedAssessment,a);
  assert.deepEqual(merged.jd,original.jd);
});

test("four dimensions contain eleven criteria; guidance is excluded and weights sum to 100", () => {
  assert.equal(scoreDimensions.length, 4);
  assert.equal(scoreDimensions.flatMap(d => d.criteria).length, 11);
  assert.ok(scoreDimensions.flatMap(d => d.criteria).every(c => c.key !== "guidance"));
  assert.equal(scoreDimensions.reduce((sum, d) => sum + d.weight, 0), 100);
  for (const d of scoreDimensions) assert.equal(d.criteria.reduce((sum, c) => sum + c.weight, 0), 100);
});
test("fully supported scores preserve 0, 75 and 100 without inflation", () => {
  for (const value of [0, 75, 100]) {
    assert.deepEqual(assessmentRange(assessment(value)), {min:value,max:value,coverage:100});
    assert.equal(scoreLabel(assessmentRange(assessment(value))), String(value));
  }
});
test("missing evidence creates bounds, not a fabricated midpoint", () => {
  const a = assessment(75);
  a.dimensions.growth.criteria.trajectory.value = null;
  const r = assessmentRange(a)!;
  assert.ok(Math.abs(r.min - 67.5) < 0.000001);
  assert.ok(Math.abs(r.max - 77.5) < 0.000001);
  assert.equal(r.coverage, 90);
  assert.equal(scoreLabel(r), "67–78");
  assert.deepEqual(assessmentRange(assessment(null)), {min:0,max:100,coverage:0});
  a.dimensions.content.criteria.duties.value = 101;
  assert.equal(dimensionScore(a, "content"), null);
  assert.equal(assessmentRange(a), null);
});
test("floating-point noise does not turn integer criterion scores into lower displayed scores", () => {
  for (let value = 0; value <= 100; value++) {
    const a = assessment(value);
    for (const d of scoreDimensions) assert.equal(scoreLabel(dimensionScore(a,d.key)),String(value));
    for (const profile of [undefined,"project","full-time"] as const) {
      assert.equal(scoreLabel(assessmentRange(a,profile)),String(value));
      assert.equal(rankOpportunities([{...job,detailedAssessment:a}],profile)[0].total,value);
    }
  }
});
test("freshness uses calendar days with 14/15 and 30/31 boundaries", () => {
  assert.equal(researchFreshness(jd,"2026-10-15").level,"recent");
  assert.equal(researchFreshness(jd,"2026-10-16").level,"review");
  assert.equal(researchFreshness(jd,"2026-10-31").level,"review");
  assert.equal(researchFreshness(jd,"2026-11-01").level,"stale");
  assert.equal(londonDate(new Date("2026-10-01T23:30:00Z")),"2026-10-02");
  assert.equal(researchFreshness({...jd,checkedAt:"2026-10-24"},"2026-10-26").days,2);
});
test("invalid, missing, future, historical or unverified evidence is not fresh", () => {
  for (const checkedAt of ["", "2026-02-30", "2026-10-06"]) assert.equal(researchFreshness({...jd,checkedAt},"2026-10-05").level,"unknown");
  for (const verification of ["Historical index", "Unverified"] as const) assert.equal(researchFreshness({...jd,verification},"2026-10-05").level,"unknown");
  assert.equal(researchFreshness({...jd,url:""},"2026-10-05").level,"unknown");
  assert.equal(researchFreshness({...jd,verification:undefined},"2026-10-05").level,"unknown");
  assert.equal(researchFreshness({...jd,verification:"Full text"},"2026-10-05").level,"recent");
});
test("old JD dates, closed status, qualifications and outcomes never change fit ranking", () => {
  const old = {...job,id:"old",jd:{...jd,status:"Closed",checkedAt:"2020-01-01"},stage:"Rejected",eligibility:"明确不满足"} as Opportunity;
  const rows=rankOpportunities([job,old]);
  assert.equal(rows.length,2);
  assert.equal(rows[0].total,rows[1].total);
  assert.equal(rows[0].rank,rows[1].rank);
});
test("progress edits preserve assessment and JD dates; changing identity invalidates assessment", () => {
  const payload={...jobFields(job),stage:"Applied" as const,notes:"已提交"};
  const entry={id:job.id,kind:"job" as const,payload,archived:false,revision:1,updatedAt:"2026-10-05T12:00:00Z"};
  const merged=mergeWorkspace([job],[entry])[0];
  assert.equal(merged.stage,"Applied");
  assert.deepEqual(merged.detailedAssessment,job.detailedAssessment);
  assert.deepEqual(merged.jd,jd);
  for (const patch of [{url:"https://example.com/other"},{role:"Producer"},{company:"Other"}]) assert.equal(mergeWorkspace([job],[{...entry,payload:{...payload,...patch}}])[0].detailedAssessment,undefined);
});
