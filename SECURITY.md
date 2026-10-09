# Security

## Report privately

Please use [GitHub private vulnerability reporting](https://github.com/engramai-co/Engram-Job-Board/security/advisories/new). Include the affected version, a minimal reproduction using synthetic data, the expected impact and any suggested fix. Do not open a public issue containing an exploit, credentials or personal data.

If private reporting is unavailable, open a minimal issue asking maintainers to enable it **without disclosing the vulnerability**. Maintainers will triage on a best-effort basis; this early project does not promise a response SLA. Only the current `main` branch is maintained.

## Local-first is not encryption

- The app has no authentication, database, telemetry or mail connector. Links open third-party sites only when followed.
- Dev and preview servers bind to loopback by default. Do not expose a private-data instance to a shared network.
- Gitignored data is still readable by local tools and the development server.
- Browser edits and exported JSON backups are not encrypted. They may contain private notes, contacts and application history; keep backups private and away from Git.
- Backups are validated and restored without overwriting existing IDs. Corrupt storage and revision conflicts block saves rather than silently replacing data.
- `pnpm build` excludes the designated local data module. `pnpm build:local` intentionally includes it, producing private artifacts in `dist-local/`.
- Any data in a deployed static build is downloadable. Hiding a field in the UI does not hide it from the bundle.
- Never place credentials in frontend data, environment variables, or `public/`. No frontend secret storage is provided.
- The public-file check is a guardrail, not a comprehensive secret or PII detector. Inspect tracked files and build output before publishing.

If a credential is exposed, revoke or rotate it first. Deleting a file in a later commit does not remove it from Git history or already downloaded artifacts. For accidental personal-data publication, remove access promptly and investigate the relevant history and artifacts.
