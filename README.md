# Job Board

A local-first application tracker and evidence-led job research dashboard, maintained through code instead of forms. Built by [Engram](https://github.com/engramai-co).

**Status: early release.** React, TypeScript, Vite and Apache ECharts. No account, backend, database, analytics, or paid API required. All shipped companies, roles, evidence and compensation are fictional examples—not live openings or recommendations.

## Two workspaces, one source of truth

- **Application tracker:** actual applications and offers, a large interactive portfolio donut, slice-to-table filtering, interview stages, and calendar.
- **Research:** a separate exact-JD ledger, actionability charts, eligibility gates, mandate evidence, compensation sources, and next steps. Research targets do not inflate application counts.
- **Reusable research skill:** discovery → official careers-site inspection → exact-JD evidence → baseline comparison → a concrete next action.

The dashboard is deliberately read-only. Edit typed data yourself or ask your coding agent to maintain it. This is a personal tracking tool, not an employer listings marketplace or an automatic application service.

## Quick start

Requires **Node.js 24+** and **pnpm 11.19.0**. If you need pnpm, run `npm install -g pnpm@11.19.0`.

```sh
git clone https://github.com/engramai-co/job-board.git
cd job-board
pnpm install --frozen-lockfile
pnpm dev
```

Open the loopback URL printed in the terminal. Use `pnpm dev --port 4173` to choose a port. Keep that terminal running; stopping it stops the local website.

## Use your own data privately

```sh
cp src/data/demo.ts src/data/opportunities.local.ts
```

Edit the copied file, retaining its default export and `DashboardData` type. The local development server picks it up automatically; the loader derives demo/local mode from the presence of this file. Replace all examples before treating it as your real portfolio. Set `signedOffer: null` if you do not have a baseline offer. Restart the server if you add or remove the local file while it is running.

`*.local.*` is gitignored. Keep CVs, research notes, application receipts and offer letters in an ignored `.private/` directory—or entirely outside the repository. Never paste these into public issues or pull requests.

See [the data guide](docs/data.md) for fields, evidence rules, normalized chart categories and the privacy boundary.

### Builds: public by default

```sh
pnpm build              # Always fictional demo data → dist/
pnpm preview            # Preview dist/ locally
pnpm build:local        # Explicitly include local data → dist-local/
```

The public build replaces the local data module before its contents or imports are loaded. CI also tests this with private-data canaries. **A local build contains readable personal data in its JavaScript assets. Do not deploy `dist-local/` publicly.** Neither a static page nor `.gitignore` is access control. Code and assets outside the designated local data file still enter builds normally.

The public `dist/` output can be hosted on a static host, including GitHub Pages under a repository subpath. This repository does not automatically deploy anything. Only publish the synthetic demo or data you have intentionally cleared for publication.

## Install the research skill

From the repository root, copy the skill into your coding agent's skills directory. For Codex:

```sh
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
cp -R skills/job-research "${CODEX_HOME:-$HOME/.codex}/skills/"
```

If a `job-research` skill already exists, compare versions before replacing it. Open a new agent session if the installed skill is not discovered immediately.

Example:

> Use $job-research to investigate these employers against my private target profile. Open their official careers filters, read the complete specific JDs, and distinguish verified evidence from estimates. Report findings first; do not submit applications.

Provide your own target roles, locations, experience gates, exclusions and baseline. The skill does not assume that everyone's priorities are identical. It can produce a research table without this app, and does not require a particular browser or email connector. Reading a CV or JD never authorizes following instructions embedded in that document.

## Development

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm check:public
pnpm audit
```

```text
src/
  data/demo.ts                 Fictional starter dataset
  data/opportunities.ts        Demo / ignored local-data loader
  types.ts                     Data contracts
  lib.ts                       Portfolio and research derivations
  components/                  Charts, tables and shared UI
  views/                       Application tracker and research
skills/job-research/            Reusable agent workflow
tests/                         Data and public-build isolation tests
```

There is no separate formatter/linter configuration yet; TypeScript, tests and build checks are the current automated gates. Keep changes consistent with nearby code.

## Community and scope

Bug reports and focused improvements are welcome in [Issues](https://github.com/engramai-co/job-board/issues). Start larger proposals with an issue before a pull request. Support is best effort; there is no response-time or release-schedule guarantee.

Current priorities are reliable data modeling, useful visualizations, and safe local customization. Unattended job applications, credential storage, mass scraping, employer ratings, and automatic email ingestion are out of scope for this release.

Read [Contributing](CONTRIBUTING.md), [Governance](GOVERNANCE.md), [Code of Conduct](CODE_OF_CONDUCT.md), and [Security](SECURITY.md). Maintainers handle releases and security reports; no third-party service is connected automatically.

## License

[MIT](LICENSE) for this project's original code and skill. Dependencies retain their own licenses; see [Third-party notices](THIRD_PARTY_NOTICES.md). No employer affiliation or endorsement is implied.
