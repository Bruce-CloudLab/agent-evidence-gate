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

  assert.match(action, /BASE_SHA="\$\(git rev-parse FETCH_HEAD\)"/);
  assert.match(action, /git diff --unified=0 "\$BASE_SHA" HEAD/);
  assert.doesNotMatch(action, /\.\.\.HEAD/);
});
