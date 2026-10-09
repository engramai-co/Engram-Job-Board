import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createServer } from "vite";
import { createFixture } from "./fixture.mjs";

let fixture;
let server;
let lib;

before(async () => {
  fixture = await createFixture();
  server = await createServer({
    root: fixture.root,
    configFile: fixture.configFile,
    logLevel: "silent",
    server: { middlewareMode: true, watch: null },
    appType: "custom"
  });
  lib = await server.ssrLoadModule("/src/lib.ts");
});

after(async () => {
  await server?.close();
  await fixture?.dispose();
});

test("public demo is explicitly fictional and does not fabricate JD or compensation verification", async () => {
  const source = await server.ssrLoadModule("/src/data/opportunities.ts");
  assert.equal(source.isDemoData, true);
  assert.match(lib.data.profile.name, /demo/i);
  assert.equal(lib.data.signedOffer.verified, false);
  assert.match(lib.data.signedOffer.source, /synthetic|fictional/i);
  assert.equal(new Set(lib.data.opportunities.map((item) => item.id)).size, lib.data.opportunities.length);
  assert.ok(lib.data.opportunities.length > 0);
  for (const item of lib.data.opportunities) {
    assert.match(item.company, /^Demo /);
    assert.equal(item.jd.status, "Unchecked");
    assert.equal(item.jd.url, "");
    assert.equal(item.jd.checkedAt, "");
    assert.equal(item.compensation.verified, false);
    if (item.application) assert.match(item.application.evidence, /fictional/i);
  }
});

test("portfolio and research are disjoint and cover every opportunity exactly once", () => {
  const portfolio = lib.getPortfolioItems();
  const research = lib.getResearchItems();
  const baseline = portfolio.find((item) => item.id === "signed-offer-baseline");
  assert.equal(baseline.stage, "Offer");
  assert.equal(portfolio[0].id, baseline.id);
  assert.equal(portfolio.length, 4);
  assert.equal(research.length, 5);
  const submitted = portfolio.filter((item) => item.id !== baseline.id);
  assert.deepEqual(
    [...submitted, ...research].map((item) => item.id).sort(),
    lib.data.opportunities.map((item) => item.id).sort()
  );
  assert.ok(submitted.every((item) => lib.portfolioStages.has(item.stage)));
  assert.ok(research.every((item) => !lib.portfolioStages.has(item.stage)));
  assert.equal(new Set([...submitted, ...research].map((item) => item.id)).size, lib.data.opportunities.length);
});

test("location counts do not turn a multi-office JD into an invented application office", () => {
  const portfolio = lib.getPortfolioItems();
  const counts = new Map();
  for (const item of portfolio) {
    const label = lib.portfolioDimension(item, "area");
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  assert.deepEqual(Object.fromEntries(counts), { "伦敦": 2, Singapore: 1, "待确认": 1 });
  const unselected = portfolio.find((item) => item.company === "Demo Orbit");
  assert.match(unselected.location, /multiple locations/i);
  assert.equal(lib.portfolioDimension(unselected, "area"), "待确认");
});

test("official role titles remain distinct while normalized chart families overlap", () => {
  const applied = lib.getPortfolioItems();
  const researchEngineer = applied.find((item) => item.company === "Demo Aurora");
  const appliedEngineer = applied.find((item) => item.company === "Demo Orbit");
  assert.notEqual(researchEngineer.role, appliedEngineer.role);
  assert.equal(lib.portfolioDimension(researchEngineer, "role"), "AI / Research Engineering");
  assert.equal(lib.portfolioDimension(appliedEngineer, "role"), "AI / Research Engineering");
  assert.equal(lib.portfolioDimension({ ...researchEngineer, mixRole: undefined, category: "" }, "role"), "待确认");
  assert.equal(lib.portfolioDimension({ ...researchEngineer, industry: "" }, "industry"), "待确认");
});

test("application table filtering uses the same normalized dimension as its chart", async () => {
  const { createElement } = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { ApplicationTable } = await server.ssrLoadModule("/src/components/ApplicationTable.tsx");
  const { UIProvider } = await server.ssrLoadModule("/src/ui.tsx");
  const { ProgressProvider } = await server.ssrLoadModule("/src/ProgressContext.tsx");
  const { WorkspaceEditors } = await server.ssrLoadModule("/src/components/WorkspaceEditors.tsx");
  const render = (filter) => renderToStaticMarkup(createElement(UIProvider, null,
    createElement(ProgressProvider, null, createElement(WorkspaceEditors, null,
      createElement(ApplicationTable, { items: lib.getPortfolioItems(), filter, onClear() {}, onShowResearch() {} })))));
  const unknownOffice = render({ view: "area", label: "待确认" });
  assert.match(unknownOffice, /Demo Orbit/);
  assert.doesNotMatch(unknownOffice, /Demo Aurora|Demo Harbor|Demo Cedar/);
  const sharedRole = render({ view: "role", label: "AI / Research Engineering" });
  assert.match(sharedRole, /Demo Aurora/);
  assert.match(sharedRole, /Demo Orbit/);
  assert.doesNotMatch(sharedRole, /Demo Harbor|Demo Cedar/);
  assert.match(render({ view: "area", label: "Missing location" }), /没有符合条件的申请/);
  const all = render(null);
  assert.match(all, /Offer · 比较基准/);
  assert.doesNotMatch(all, /aria-label="申请状态：Offer，Demo Cedar/);
});

test("baseline cash separates one-time sign-on from recurring compensation", () => {
  const offer = lib.data.signedOffer;
  assert.equal(lib.yearOneCash, offer.base + offer.projectedBonus + offer.firstYearSignOn);
  assert.equal(lib.recurringCash, offer.base + offer.projectedBonus);
  assert.equal(lib.yearOneCash - lib.recurringCash, offer.firstYearSignOn);
  assert.equal(lib.yearOneCash, 110000);
  assert.equal(lib.recurringCash, 102000);
});

test("untrusted external links cannot use executable or local-file schemes", () => {
  assert.equal(lib.safeExternalUrl("https://example.com/job"), "https://example.com/job");
  assert.equal(lib.safeExternalUrl("http://example.com/job"), "http://example.com/job");
  for (const url of [undefined, "", "not a URL", "javascript:alert(1)", "data:text/html,example", "file:///private/example", "//example.com/job"]) {
    assert.equal(lib.safeExternalUrl(url), undefined);
  }
});

test("JD evidence does not claim an unchecked or undated opening was browser-verified", () => {
  assert.match(lib.jdEvidence("Unchecked", ""), /尚无浏览器核验记录/);
  assert.match(lib.jdEvidence("Live", ""), /尚无浏览器核验记录/);
  assert.match(lib.jdEvidence("Closed", "2026-08-20"), /核验方式未记录/);
  assert.match(lib.jdEvidence("Live", "2026-08-20", "Browser"), /浏览器核验/);
  assert.match(lib.jdEvidence("Live", "2026-08-20", "Full text"), /网页全文核验/);
  assert.doesNotMatch(lib.jdEvidence("Live", "2026-08-20", "Full text"), /浏览器核验/);
  assert.equal(lib.jdSourceLabel({url:"https://example.com/job"}), "JD 来源待核验");
  assert.equal(lib.jdSourceLabel({url:"https://example.com/job",source:"Employer"}), "官方 JD");
});
