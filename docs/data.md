# Data and evidence

The complete contract is [src/types.ts](../src/types.ts); the runnable starter is [src/data/demo.ts](../src/data/demo.ts). Keep real data in the ignored `src/data/opportunities.local.ts` default export. Do not edit the public demo with personal content.

## Separate three kinds of state

1. **Application stage** describes what actually happened: researching, applied, assessment, interviewing, final round, or offer. Move a record only with user confirmation or authorized evidence.
2. **Research status** describes an advisory decision: needs validation, high-upside reach, monitor opening, deprioritized, or not actionable. It never automatically hides a record. The legacy `Applied` value is retained but is not a recommendation.
3. **JD availability** describes the public page: live, evergreen, closed, or unchecked. An applied role can later close without erasing the application.

Do not convert a recommendation into an application, or a blocked careers page into a confirmed closed JD. Do not change `checkedAt` unless the role was actually checked again.

## Minimum useful opportunity record

| Area | Fields and meaning |
| --- | --- |
| Identity | Stable unique `id`, `company`, exact official `role`, specific `jd.url` |
| Availability | `jd.status`, `jd.checkedAt`, source, verification method and identity-match confidence |
| Contract | `work.contract`, hours, duration, start, workplace, deadline; do not infer contract from hours |
| Scoring | `detailedAssessment`: version, assessed date, four dimensions, eleven evidence-backed subcriteria, reservation |
| Geography | Verbatim `location`, region, evidenced chart city `mixArea`, primary/secondary priority |
| Work | Team/desk, normalized `mixRole`, industry, core-AI/front-office assessments |
| Evidence | `alignment.evidence`, fit reason, required eligibility, hard gaps |
| Compensation | Separate components, currency in the source description, source, confidence, verification status |
| Decision | Research status, baseline hurdle judgment, specific next step |
| Application | Optional receipt/user-confirmation evidence with timestamp and role-mapping certainty |

`frontOffice` and `coreAi` are nullable: `null` means not established, not automatically false. A title alone is not enough. Put concise, attributed evidence in the record, not a complete copyrighted JD. Keep detailed private notes outside the public dataset.

An empty JD URL and `Unchecked` status are acceptable for a **provisional discovery lead** or fictional demo. They are not an officially verified opportunity. Only use HTTP(S) URLs to an actual role when known; never disguise a careers homepage as an exact JD.

## Normalize analytics without altering source facts

`role` preserves the exact title. `mixRole` is a stable analytical family such as `Quant Research`, `AI / Research Engineering`, or `Software Engineering`. Choose groupings based on the work, not small differences in titles.

`location` can retain several offices from a JD. `mixArea` records the known application office as one canonical city. If unresolved, use `null`; the chart shows 待确认. Do not invent an office to remove an unknown slice. Each application counts once; multi-location availability is not double-counted.

The portfolio includes the optional baseline plus submitted applications, active processes and retained rejected/withdrawn history. Research has pending and applied scopes within each contract pool; charts use the selected scope. Applied records keep their scores and research. Avoid duplicating a baseline as a separate application.

## Shared records, local edits and provenance

`src/data/opportunities.local.ts` owns researched source data; browser entries are an overlay keyed by stable opportunity ID. `mergeWorkspace` preserves JD evidence and scores for normal progress edits. A company, title or JD URL change invalidates the fit assessment; a changed URL becomes unverified. Contract changes reweight the same criterion evidence.

Source refreshes do not erase browser status, notes or other saved fields. If both have changed, reconcile deliberately—do not clear localStorage as a shortcut. Manual new jobs begin unverified and unscored. Research additions remain Researching until the user confirms submission.

Submission dates and registration dates are distinct. Editing a note does not refresh JD verification. A valid Browser or Full text check may support freshness; historical indices and search snippets cannot.

Browser storage is validated and revision checked before every write. Exported backups preserve edit IDs and are incrementally restored without overwriting existing IDs. They do not include the entire typed source dataset; see [backup instructions](setup.md#browser-local-storage-and-backups).

Legacy `interviews` and `events` arrays remain visible and editable. Their initial IDs derive from the source job/date/title; once edited, preserve that source identity rather than renaming it behind the overlay. Updating schedule details through the UI keeps the ID.

## Scores and contract pools

See [scoring and freshness](../skills/job-research/references/scoring.md) for the full rubric. The executable source is `src/ranking.ts`: content/capability/career/platform weights are 30/45/15/10 for projects and 30/25/25/20 for full-time. Unknown contracts use a separate reference pool. Full-time internships remain in the project pool.

Criteria are 0–100 with evidence reasons; unknowns are null and produce a disclosed range, not a fabricated midpoint. Ranks compare only within a pool. Eligibility and time do not change scores or automatically hide jobs. Freshness warnings use 14/30-day boundaries; these are product defaults, not measured half-lives.

## Compensation and baseline

The optional `signedOffer` provides a user-entered comparison baseline. Set it to `null` or omit it when there is none. Its terms, status and source are rendered from data, not hardcoded.

- Estimated first-year cash = base + projected annual bonus + first-year sign-on.
- Estimated recurring cash = base + projected annual bonus.
- Equity is recorded separately and is not counted as cash.
- A projected bonus is uncertain even if the written offer is verified.
- Unknown opportunity components should be `null`, not zero.

`profile.currency` is the baseline display currency. Opportunity compensation is deliberately descriptive: retain original currency, level and geography in its display/source rather than silently converting or applying a foreign-office range. There is no automatic FX conversion or tax adjustment.

The current schema supports a concise source description rather than a full provenance database. Use the [research skill record guide](../skills/job-research/references/records.md) for richer provenance and private evidence logs when needed. Never present a third-party estimate as a verified offer.

## Private data is a local convention, not a security boundary

Development loads `opportunities.local.ts` when present, otherwise the demo. Public builds are demo-only; the Vite plugin intercepts the local module before reading its source. A dedicated test creates a private canary module and checks that it and its imported dependencies do not enter public artifacts.

This protection only covers the designated module. Personal text in components, public assets, committed files, environment values or other imported modules still needs manual removal. TypeScript data is code, so only use trusted local modules. Never put secrets in a browser application.

`pnpm build:local` intentionally produces a private-data bundle in `dist-local/`. Do not publish that directory or upload it in a public issue. Gitignored data is not encrypted or backed up automatically; manage private backups separately.
