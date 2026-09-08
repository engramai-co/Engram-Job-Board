import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// A release guardrail, not a comprehensive secret or personal-data detector.
// Inspect tracked content, not ignored local datasets or dependencies.
const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
if (!files.length) throw new Error('No tracked files: stage the intended public files before running this check.');
const riskyPath = /(^|\/)(?:node_modules|dist(?:-local)?|\.private|private|\.impeccable|research_[^/]*|tmp)(?:\/|$)|(?:^|\/)\.env(?:\.|$)|\.local\.|\.(?:pem|key|p12|pdf|eml|mbox)$/i;
const credentials = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bgh[pousr]_[A-Za-z0-9]{30,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{30,}\b/,
  /\bAKIA[A-Z0-9]{16}\b/,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b/,
  /https?:\/\/[^\s/@:]+:[^\s/@]+@/,
  /(?:\/Users\/|\/home\/)[a-zA-Z0-9_.-]+\//
];
const failures = [];
for (const file of files) {
  if (riskyPath.test(file)) failures.push(`${file}: private or generated path must not be tracked`);
  const content = readFileSync(file);
  if (content.byteLength > 2_000_000) failures.push(`${file}: unusually large tracked file; inspect before release`);
  if (credentials.some((pattern) => pattern.test(content.toString('utf8')))) {
    failures.push(`${file}: possible credential or personal absolute path (value redacted)`);
  }
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Checked ${files.length} tracked files: no blocked paths or recognized credential patterns. Manually inspect personal content before publishing.`);
}
