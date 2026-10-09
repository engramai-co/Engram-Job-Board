# Opportunity evidence and reconciliation

Map this conceptual contract to the existing schema. In Engram-Job-Board, consult `src/types.ts` and `docs/data.md`.

| Group | Meaning |
| --- | --- |
| Identity | Stable ID, employer, exact title, requisition, exact JD URL |
| Sources | Official/ATS or employer LinkedIn; supporting links, method, identity-match uncertainty |
| Dates | Posted, reposted, discovered, checked, submitted and registered—never conflate them |
| Availability | Live, Evergreen, Closed, Unchecked; access issues independent |
| Geography | Verbatim location, canonical cities, remote eligibility, evidenced application office |
| Terms | Contract, hours, start, duration, workplace, travel, deadline, pay period |
| Mandate | Responsibilities, outputs, team, collaborators; specialist alignment only when relevant |
| Fit | CV/portfolio matches, gaps, preferences, evidence-linked subcriteria |
| Pay | Separate components, currency/period, source/date/confidence, guaranteed versus estimated |
| Decision | Existing taxonomy, strongest reservation, concrete next step |
| Application | Actual stage, known submission date, confirmation source, registration date, role mapping |
| History | Previous links/status, manual exclusions, notes, interviews and events |

Use brief sourced paraphrases, not full copied JDs. Unknown fields remain unknown.

## This board's verification fields

- `jd.source`: `Employer` (official/ATS), `LinkedIn`, `Indeed`, or `User`; omit when unknown.
- `jd.verification`: `Browser` after actual browser inspection; `Full text` for retrieved full text; `Historical index` for historical evidence; `Unverified` for discovery.
- `jd.checkedAt`: actual check date, never today by default. Failed checks must not replace a successful verification.
- `jd.status`: `Live`, `Evergreen`, `Closed`, `Unchecked`, or `Availability unclear`.
- `jd.match`: `Confirmed`, `Probable`, or `Unresolved`. A possible match does not establish the submitted role.

Homepages belong in supporting notes, not the exact JD field. A missing link can remain blank for a confirmed application; never invent it.

## Deduplication and lifecycle

1. Check active, archived and excluded IDs before import.
2. Prefer employer + requisition; verify title/location without IDs. Similar titles alone are insufficient.
3. Preserve URL history. Verify a reissued requisition is the same application before merging.
4. Keep user-confirmed facts separate from JD facts. Never replace a submitted office with another advertised city.
5. Use one stable ID across views. Rejected records keep fit evidence and history.
6. “Applying” is not “applied.” Unknown submission dates stay blank; registration is separate.
7. Browser edits overlay source data. Check newer edits before refresh; never wipe the workspace to make source changes appear.

## Advisory decisions

Reuse current labels. Needs validation identifies a question, not a filter. Report competitive gaps and mandatory requirements honestly without hiding jobs. Reach does not mean requirements pass.

Only user-directed exclusions remove targets from active consideration. Do not automatically archive for age, eligibility, score or rejection. Closed jobs can remain in history.

## Pay and analytics

Unknown/null differs from explicitly unpaid or verified zero. Preserve currency/period. Recurring cash is base + relevant bonus with uncertainty; first-year adds applicable one-offs. Equity stays separate. Estimates never become verified offers.

Exact titles stay separate from role families. Source location stays separate from chosen application office. Do not create a slash-delimited pseudo-city. Application pies count each submission once with an evidenced office or unknown; multi-location coverage can overlap only with a disclosed denominator.

Research and applications have different populations, but submitted records remain inspectable in research. Full-time internships belong in the project pool; unknown contracts stay separate.

Before delivery, check links, dates, status provenance, deduplication, pools, score evidence and linked views. Change only verified or explicitly requested facts.
