# Evidence scoring and freshness

Four broad dimensions contain eleven 0–100 subcriteria. This weighted additive model is a transparent **preference model**, not a validated hiring probability, employer tier or scientific measurement.

Reuse `src/ranking.ts`. Other boards may use their own explicit model; do not silently replace it.

## Pool weights

| Dimension | Internship / Part-time / Freelance / Volunteer | Full-time | Unconfirmed reference |
| --- | ---: | ---: | ---: |
| Content | 30 | 30 | 30 |
| Capability evidence | 45 | 25 | 40 |
| Career value | 15 | 25 | 20 |
| Platform preference | 10 | 20 | 10 |

FT modestly raises platform weight; it adds no free points. Pools rank independently. A contract change reweights the same evidence.

Full-time internships stay in the project pool. Remote is workplace, not contract. Fixed-term is duration, not necessarily freelance or part-time. Unknown stays unconfirmed.

## Subcriteria

| Dimension | Internal weights |
| --- | --- |
| Content | Main duties `duties` 50%; hands-on participation `creative` 30%; target direction `direction` 20% |
| Evidence | Core skills `skills` 40%; comparable projects `projects` 30%; responsibility level `level` 20%; demonstrable work `proof` 10% |
| Career value | Future ownership `ownership` 50%; target trajectory `trajectory` 50% |
| Platform | Evidenced scale `scale` 60%; relevant brand/CV value `brand` 40% |

Responsibility level assesses past contribution; future ownership assesses the role's opportunity. Content concerns the job; evidence concerns the candidate. Avoid double counting.

## Assigning values

Read the JD and candidate materials. Each value needs a concise reason and source. Use consistent anchors, not a mechanical 1–5 conversion:

- 0–20: directly conflicting or little supported overlap.
- 21–40: limited overlap or substantial demonstrated gaps.
- 41–60: mixed, partly relevant evidence.
- 61–80: strong overlap with identifiable limitations.
- 81–95: unusually close, specific support.
- 96–100: near-complete evidence for that criterion; exceptional.

Higher scores need stronger evidence, not adjectives. Do not push all jobs above 70 or force a bell curve. A shortlist may naturally be strong; inspect repeated assumptions and double counting if scores cluster.

Unknown is `null`, not 0, 50 or an invented midpoint. Unknown differs from evidence of low fit. Code represents missing contributions with bounds and coverage; explain ranges as unresolved scoring evidence, **not confidence intervals or predicted outcomes**. Gather evidence before manufacturing precision.

Dimension = sum(value × internal weight) / 100. Total = sum(dimension × pool weight) / 100. Use code for rounding and sorting; never edit derived totals.

## Excluded factors

- Degrees, eligibility, visa and starts: separate flags, no automatic filters.
- JD age/freshness: warnings only.
- Applied/rejected/withdrawn outcomes: preserve fit.
- Learning, guidance, mentorship: no criterion; vague JDs cannot establish quality.
- Unsupported compensation/culture promises: no platform bonus.

## Freshness

Calendar days since a successful current JD check:

| Age | Warning |
| --- | --- |
| 0–14 | Recently checked |
| 15–30 | Recheck suggested |
| Over 30 | Information may be stale |
| Missing/invalid verification, historical-only, unresolved match | Not verified |

These are product heuristics, not a statistical half-life. They change no score, order, stage or visibility. Closing dates are separate. Formatting, blocked requests and snippets do not reset verification.

## Validation

Check all criterion keys and finite values within 0–100, stable identity, evidence reasons, weights totaling 100, correct pool and no personal details in public examples. Applied jobs remain scoreable. Preserve notes and application state when rescoring.
