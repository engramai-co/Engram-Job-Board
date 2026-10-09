# Engram-Job-Board

## Job research skill

[**job-research**](skills/job-research/SKILL.md) turns LinkedIn and employer-site discovery into a small, evidence-backed shortlist: exact JD → candidate evidence → contract-specific scoring → next action. It keeps full-time and internship/part-time/project opportunities separate, flags stale evidence without reducing fit scores, and maintains linked research/application records only when requested.

After cloning the repository (see below), install the skill for Codex from the repository root:

```sh
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
cp -R skills/job-research "${CODEX_HOME:-$HOME/.codex}/skills/"
```

If the skill already exists, compare versions before replacing it. Start a new agent session if needed, then ask:

> Use $job-research to investigate these employers against my target profile. Read the specific official JDs, show evidence and gaps, and update my local tracker. Do not submit applications.

## Quick setup

Requires **Node.js 24+** and **pnpm 11.19.0**.

```sh
git clone https://github.com/engramai-co/Engram-Job-Board.git
cd Engram-Job-Board
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL printed in the terminal. The starter uses fictional demo data. Update application status, add interviews and events, and export browser-local edits as a backup. Nothing is automatically submitted or uploaded.

For private data, builds, troubleshooting and development, see the [detailed setup guide](docs/setup.md).
