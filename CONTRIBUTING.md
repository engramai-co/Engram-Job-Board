# Contributing

Thanks for helping make Engram-Job-Board useful for more people. Start with the [setup guide](docs/setup.md) for installation and project scope.

## Local setup and checks

Use Node.js 24+ and pnpm 11.19.0. Clone the repository and run:

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm typecheck
pnpm test
pnpm build
pnpm check:public
```

Use fictional fixtures when reproducing problems. Keep private data in `src/data/opportunities.local.ts`, not `demo.ts`. Read [the data guide](docs/data.md) before changing schemas or chart counting rules.

## Proposing changes

- Small bug fixes and documentation corrections can be proposed directly as a pull request.
- Discuss new features and breaking schema changes in an issue first. Explain the user problem, migration impact, and maintenance tradeoffs.
- Keep changes focused. Add behavioral tests for data, filtering, privacy or build changes. Include synthetic-data screenshots for visual changes and test a narrow viewport.
- Use descriptive commit messages; no special prefix is required.
- Match nearby TypeScript/React conventions: explicit types at data boundaries, small components, and no new backend or telemetry without prior discussion.

Review is best effort. Maintainers may ask for a smaller scope or decline changes that conflict with the user-controlled, local-first design. See [Governance](GOVERNANCE.md).

## Publication safety

Before opening a pull request, inspect `git diff --cached` and `git status`. Never include CVs, resumes, email messages, real application histories, contact details, credentials or offer letters. Sanitizing a screenshot also means checking tooltips, browser chrome and filenames.

`pnpm check:public` catches common risky paths and credential formats; it cannot recognize all personal information. Human review remains necessary. Do not force-add ignored files. Never upload `dist-local/` as an artifact.

Report vulnerabilities privately using [Security](SECURITY.md), not a public issue.
