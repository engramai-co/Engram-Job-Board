# Engram-Job-Board

## Job research skill

[**job-research**](skills/job-research/SKILL.md) turns employer discovery into evidence-backed decisions: search → official careers-site inspection → exact JD → fit and compensation comparison → next action. It uses your own target roles, locations, experience and baseline, and can maintain the dashboard when requested.

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

Open the local URL printed in the terminal. The starter uses fictional demo data.

For private data, builds, troubleshooting and development, see the [detailed setup guide](docs/setup.md).
