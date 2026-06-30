import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("GitHub Action writes PR body through env var, not direct heredoc interpolation", () => {
  const action = readFileSync(new URL("../action.yml", import.meta.url), "utf8");

  assert.match(action, /PR_BODY: \$\{\{ github\.event\.pull_request\.body \}\}/);
  assert.match(action, /printf '%s\\n' "\$PR_BODY"/);
  assert.doesNotMatch(action, /cat > "\$RUNNER_TEMP\/agent-evidence-pr-body\.md" <<'PR_BODY'[\s\S]*github\.event\.pull_request\.body/);
});

test("GitHub Action exposes maintainer-controlled protected path approval input", () => {
  const action = readFileSync(new URL("../action.yml", import.meta.url), "utf8");

  assert.match(action, /allow-protected-paths:/);
  assert.match(action, /--allow-protected-paths/);
});

test("GitHub Action uses fetched base sha without triple-dot merge-base diff", () => {
  const action = readFileSync(new URL("../action.yml", import.meta.url), "utf8");

  assert.match(action, /BASE_SHA: \$\{\{ github\.event\.pull_request\.base\.sha \}\}/);
  assert.match(action, /git fetch --no-tags --depth=1 origin "\$BASE_SHA"/);
  assert.match(action, /git show "\$BASE_SHA:\$AGENTS_PATH" > "\$RUNNER_TEMP\/agent-evidence-policy\.md"/);
  assert.match(action, /git diff --unified=0 "\$BASE_SHA" HEAD/);
  assert.doesNotMatch(action, /\.\.\.HEAD/);
});

test("GitHub Action passes trusted base policy file and original policy path separately", () => {
  const action = readFileSync(new URL("../action.yml", import.meta.url), "utf8");

  assert.match(action, /--agents "\$RUNNER_TEMP\/agent-evidence-policy\.md"/);
  assert.match(action, /--policy-path "\$AGENTS_PATH"/);
  assert.doesNotMatch(action, /--agents "\$AGENTS_PATH"/);
});

test("GitHub Action moves inputs into env vars before shell use", () => {
  const action = readFileSync(new URL("../action.yml", import.meta.url), "utf8");

  assert.match(action, /EVIDENCE_PATH: \$\{\{ inputs\.evidence-path \}\}/);
  assert.match(action, /FORMAT: \$\{\{ inputs\.format \}\}/);
  assert.match(action, /THRESHOLD: \$\{\{ inputs\.threshold \}\}/);
  assert.match(action, /ALLOW_PROTECTED_PATHS: \$\{\{ inputs\.allow-protected-paths \}\}/);
  assert.doesNotMatch(action, /if \[ -n "\$\{\{ inputs\.threshold \}\}" \]/);
});
test("GitHub Action quotes description values containing colons", () => {
  const action = readFileSync(new URL("../action.yml", import.meta.url), "utf8");

  for (const line of action.split(/\r?\n/)) {
    const match = line.match(/^\s+description:\s+(.+:\s+.+)$/);
    if (match) {
      assert.match(match[1], /^(".*"|'.*')$/);
    }
  }
});
test("GitHub Action exposes reusable scorecard outputs", () => {
  const action = readFileSync(new URL("../action.yml", import.meta.url), "utf8");

  assert.match(action, /^outputs:\n/m);
  assert.match(action, /status:\n\s+description: Current gate status\.\n\s+value: \$\{\{ steps\.run-gate\.outputs\.status \}\}/);
  assert.match(action, /score:\n\s+description: Numeric score from 0 to 100\.\n\s+value: \$\{\{ steps\.run-gate\.outputs\.score \}\}/);
  assert.match(action, /scorecard-markdown:\n\s+description: Markdown scorecard body\.\n\s+value: \$\{\{ steps\.run-gate\.outputs\.scorecard-markdown \}\}/);
  assert.match(action, /scorecard-json:\n\s+description: JSON scorecard body\.\n\s+value: \$\{\{ steps\.run-gate\.outputs\.scorecard-json \}\}/);
  assert.match(action, /scorecard-path:\n\s+description: Path to the Markdown scorecard file\.\n\s+value: \$\{\{ steps\.run-gate\.outputs\.scorecard-path \}\}/);
});

test("GitHub Action writes outputs before failing not-ready checks", () => {
  const action = readFileSync(new URL("../action.yml", import.meta.url), "utf8");

  assert.match(action, /id: run-gate/);
  assert.match(action, /MARKDOWN_EXIT=\$\?/);
  assert.match(action, /GATE_EXIT=\$MARKDOWN_EXIT/);
  assert.match(action, />> "\$GITHUB_OUTPUT"/);
  assert.match(action, /id: finalize/);
  assert.match(action, /exit "\$\{\{ steps\.run-gate\.outputs\.gate-exit \}\}"/);

  const runGateIndex = action.indexOf("id: run-gate");
  const outputIndex = action.indexOf('>> "$GITHUB_OUTPUT"');
  const finalizeIndex = action.indexOf("id: finalize");

  assert.ok(runGateIndex >= 0);
  assert.ok(outputIndex > runGateIndex);
  assert.ok(finalizeIndex > outputIndex);
});
