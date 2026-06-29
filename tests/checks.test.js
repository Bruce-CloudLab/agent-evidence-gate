import test from "node:test";
import assert from "node:assert/strict";
import { runCheck } from "../src/checks.js";

const agentsText = `
# AGENTS.md

\`\`\`agent-evidence
must_run: node --test
protected_path: .github/**
forbid_added_pattern: console.log
require_evidence: test
max_changed_files: 5
min_score: 80
\`\`\`
`;

const safeDiff = `diff --git a/src/math.js b/src/math.js
--- a/src/math.js
+++ b/src/math.js
@@ -1 +1,2 @@
 export const add = (a, b) => a + b;
+export const subtract = (a, b) => a - b;
`;

const passingEvidence = `Verification

Command:
node --test

Result:
# pass 4
# fail 0
exit code 0
`;

test("runCheck returns ready for evidence-backed safe changes", () => {
  const scorecard = runCheck({
    agentsText,
    diffText: safeDiff,
    evidenceText: passingEvidence,
    prBodyText: "Implemented subtract helper."
  });

  assert.equal(scorecard.status, "ready");
  assert.equal(scorecard.score, 100);
  assert.equal(scorecard.blocking.length, 0);
});

test("runCheck blocks missing evidence and missing required command", () => {
  const scorecard = runCheck({
    agentsText,
    diffText: safeDiff,
    evidenceText: "",
    prBodyText: "Fixed and ready."
  });

  assert.equal(scorecard.status, "not_ready");
  assert.ok(scorecard.blocking.some((issue) => issue.code === "missing_evidence"));
  assert.ok(scorecard.blocking.some((issue) => issue.code === "missing_required_command"));
  assert.ok(scorecard.blocking.some((issue) => issue.code === "completion_claim_without_evidence"));
});

test("runCheck blocks protected path changes without approval", () => {
  const diff = `diff --git a/.github/workflows/ci.yml b/.github/workflows/ci.yml
--- a/.github/workflows/ci.yml
+++ b/.github/workflows/ci.yml
@@ -1 +1,2 @@
 name: ci
+on: push
`;

  const scorecard = runCheck({
    agentsText,
    diffText: diff,
    evidenceText: passingEvidence
  });

  assert.equal(scorecard.status, "not_ready");
  assert.ok(scorecard.blocking.some((issue) => issue.code === "protected_path_changed"));
});

test("runCheck blocks forbidden added patterns", () => {
  const diff = `diff --git a/src/index.js b/src/index.js
--- a/src/index.js
+++ b/src/index.js
@@ -1 +1,2 @@
 export const value = 1;
+console.log(value);
`;

  const scorecard = runCheck({
    agentsText,
    diffText: diff,
    evidenceText: passingEvidence
  });

  assert.equal(scorecard.status, "not_ready");
  assert.ok(scorecard.blocking.some((issue) => issue.code === "forbidden_added_pattern"));
});
