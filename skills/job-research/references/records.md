# Opportunity evidence contract

This is a conceptual contract, not a drop-in TypeScript schema. Adapt it to the user's existing board without breaking its data model. Store each distinct official JD as one opportunity, and preserve history when a role changes.

## Minimum record

| Field group | Required meaning |
| --- | --- |
| Identity | Stable ID, company, exact official job title, official job ID if present, exact JD URL. |
| Verification | `browser` / `official-text` / `discovery-only`, actual checked date, official source links, any inaccessible content. Only actual browser inspection gets a browser-checked date. |
| JD availability | `Live`, `Evergreen`, `Closed`, or `Unverified`. Use `Unverified` when access/evidence is insufficient; do not guess closure. |
| Geography | Canonical office list, primary/secondary geography classification, remote constraints; chosen application office only if evidenced. |
| Mandate | Team/desk, responsibilities, collaborators, work outputs; front-office/core-AI assessments as yes/no/uncertain with supporting evidence when relevant. |
| Eligibility | Degree, mandatory/preferred experience, graduation-year window, start date, work-authorization requirements; exact source and unresolved gates. |
| Fit | CV-backed matches, hard gaps, preference mismatches, specific recommendation rationale. |
| Compensation | Currency, period, base/bonus/sign-on/equity components, first-year and recurring cash, source/date/confidence, guaranteed versus projected, calculation assumptions. |
| Decision | Explicit current research decision, baseline hurdle judgment, strongest reservation, concrete next step. |
| Application | Independent lifecycle stage, submission date and evidence if known, exact-role mapping confidence; never inferred from recommendation. |

Use short supporting excerpts or paraphrases with links, not full copied JDs. An optional confidence label should describe evidence quality, not an invented probability of receiving an offer.

## Research decisions

Keep these separate from application status and JD availability. Use existing equivalent labels when appropriate; do not force a schema migration merely to adopt wording.

| Decision | Meaning | Useful next step |
| --- | --- | --- |
| Ready to consider | Verified, relevant JD; known hard gates pass; plausible reason to change the baseline decision. | Decide whether to apply or obtain the remaining non-blocking detail. |
| Needs validation | A potentially qualifying role has a decision-changing uncertainty. | Name the exact question, evidence source, and owner—for example desk alignment or mandatory experience. |
| High-upside reach | Relevant, verified opportunity with a substantial competitive gap, but no known unsatisfied mandatory gate. | Assess whether the upside justifies targeted preparation or an application. |
| Monitor opening | No current qualifying opening, or an evergreen channel without a concrete opening/timing. | Identify the official source or trigger to recheck; do not schedule monitoring unless requested. |
| Deprioritized | Available but below the user's current work-content, compensation, culture, or preference threshold. | Preserve the reason and the condition that would change it. |
| Not actionable | Closed, explicitly excluded, or blocked by a known mandatory gate. | Archive or revisit only if the blocking condition changes. |

“Applied,” “Interviewing,” and “Offer” are application stages, not research recommendations. Submitted records may retain their research assessment, but must not appear as fresh unsubmitted targets.

A mandatory degree or experience mismatch belongs under Not actionable unless the employer confirms an exception. The same applies to a confirmed mismatch against the user's required mandate; use Deprioritized for softer preference or relative-value judgments. “Reach” is not a way to conceal a hard gate. A missing verified JD can be a discovery lead or Monitor opening record, never Ready to consider.

## Compensation semantics

- Store unpublished or unknown amounts as unknown/null, not zero. Preserve a genuine stated zero separately.
- Recurring cash = annual base + relevant annual cash bonus, with the bonus certainty visibly qualified. First-year cash adds applicable first-year cash payments, including sign-on, and uses any prorating explicitly stated.
- Keep equity separate from cash. For estimated total compensation, show vesting period, valuation basis, and whether it is liquid. Avoid merging paper equity with guaranteed cash in a single unlabeled number.
- Official JD ranges are verified **posted ranges**, not verified offers. A recruiter estimate is not a written guarantee. Third-party reported compensation remains an estimate with location, level, sample/date limitations.
- Flag sign-on repayment, bonus timing, and other known material terms without assuming terms that have not been provided. Do not produce net-of-tax comparisons without suitable current inputs.

## Chart semantics

Preserve detailed source fields separately from analytical labels:

- `officialTitle` can be specific while `roleFamily` groups comparable work consistently.
- A role available in two cities has two location values, not a new slash-delimited city category.
- For an application-count pie, each application needs one evidenced office or an explicit unknown/multi-location category. Do not silently assign a preferred city to make slices add up.
- For location coverage charts, count each supported city once per role, and disclose that the sum can exceed the number of roles. A bar chart is often clearer than a pie for overlapping coverage.
- Research counts and application counts have different populations. Show the denominator and exclude applied records from an unsubmitted research pipeline.

## Final consistency check

Check current source URLs versus generic homepages, actual verification dates versus publication dates, known gates versus decision labels, compensation certainty versus wording, and application evidence versus stage. Refresh only the facts actually rechecked. Unresolved fields should stay visible rather than being normalized into false certainty.
