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

test("runCheck does not accept protected path approval from PR or evidence text", () => {
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
    evidenceText: `${passingEvidence}\napproved protected path`,
    prBodyText: "approved protected path"
  });

  assert.equal(scorecard.status, "not_ready");
  assert.ok(scorecard.blocking.some((issue) => issue.code === "protected_path_changed"));
});

test("runCheck allows protected paths only through maintainer-controlled option", () => {
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
    evidenceText: passingEvidence,
    allowProtectedPaths: true
  });

  assert.equal(scorecard.status, "ready");
  assert.ok(scorecard.warnings.some((issue) => issue.code === "protected_path_approved"));
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

test("runCheck rejects vague ok evidence", () => {
  const scorecard = runCheck({
    agentsText,
    diffText: safeDiff,
    evidenceText: "Command: node --test\nResult: looks ok",
    prBodyText: "Fixed and ready."
  });

  assert.equal(scorecard.status, "not_ready");
  assert.ok(scorecard.blocking.some((issue) => issue.code === "missing_evidence"));
  assert.ok(scorecard.blocking.some((issue) => issue.code === "completion_claim_without_evidence"));
});

test("runCheck rejects evidence with nonzero node test failures", () => {
  const scorecard = runCheck({
    agentsText,
    diffText: safeDiff,
    evidenceText: "Command: node --test\nResult:\n# pass 4\n# fail 1\nexit code 1",
    prBodyText: "Fixed and ready."
  });

  assert.equal(scorecard.status, "not_ready");
  assert.ok(scorecard.blocking.some((issue) => issue.code === "failing_evidence"));
  assert.ok(scorecard.blocking.some((issue) => issue.code === "missing_evidence"));
  assert.ok(scorecard.blocking.some((issue) => issue.code === "completion_claim_without_evidence"));
});

test("runCheck rejects pass count without zero-failure or zero-exit evidence", () => {
  const scorecard = runCheck({
    agentsText,
    diffText: safeDiff,
    evidenceText: "Command: node --test\nResult:\n# pass 4",
    prBodyText: "Fixed and ready."
  });

  assert.equal(scorecard.status, "not_ready");
  assert.ok(scorecard.blocking.some((issue) => issue.code === "missing_evidence"));
  assert.ok(scorecard.blocking.some((issue) => issue.code === "completion_claim_without_evidence"));
});

test("runCheck rejects mixed passed and failed text summaries", () => {
  const scorecard = runCheck({
    agentsText,
    diffText: safeDiff,
    evidenceText: "Command: node --test\nResult: tests: 4 passed, 1 failed",
    prBodyText: "Fixed and ready."
  });

  assert.equal(scorecard.status, "not_ready");
  assert.ok(scorecard.blocking.some((issue) => issue.code === "failing_evidence"));
});

test("runCheck accepts concrete node test summary evidence without exit code", () => {
  const scorecard = runCheck({
    agentsText,
    diffText: safeDiff,
    evidenceText: "Command: node --test\nResult:\n# pass 4\n# fail 0",
    prBodyText: "Fixed and ready."
  });

  assert.equal(scorecard.status, "ready");
  assert.ok(scorecard.passed.some((issue) => issue.code === "completion_claim_has_evidence"));
});

test("runCheck backs completion claims with concrete evidence when no contract block exists", () => {
  const scorecard = runCheck({
    agentsText: "# AGENTS.md\n\nNo evidence block yet.",
    diffText: safeDiff,
    evidenceText: "Command: node --test\nResult:\n# pass 4\n# fail 0\nexit code 0",
    prBodyText: "Fixed and ready."
  });

  assert.equal(scorecard.status, "ready");
  assert.ok(scorecard.passed.some((issue) => issue.code === "completion_claim_has_evidence"));
});

test("runCheck protects the policy file path even when no policy block exists", () => {
  const diff = `diff --git a/AGENTS.md b/AGENTS.md
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -1 +1,2 @@
 # AGENTS.md
+No policy here anymore.
`;

  const scorecard = runCheck({
    agentsText: "# AGENTS.md\n\nNo evidence block yet.",
    diffText: diff,
    evidenceText: passingEvidence,
    prBodyText: "Fixed and ready."
  });

  assert.equal(scorecard.status, "not_ready");
  assert.ok(scorecard.blocking.some((issue) => issue.code === "protected_path_changed"));
});

test("runCheck protects a custom policy file path", () => {
  const diff = `diff --git a/docs/agent-policy.md b/docs/agent-policy.md
--- a/docs/agent-policy.md
+++ b/docs/agent-policy.md
@@ -1 +1,2 @@
 # Policy
+No policy here anymore.
`;

  const scorecard = runCheck({
    agentsText: "# Policy\n\nNo evidence block yet.",
    diffText: diff,
    evidenceText: passingEvidence,
    policyPath: "docs/agent-policy.md"
  });

  assert.equal(scorecard.status, "not_ready");
  assert.ok(scorecard.blocking.some((issue) => issue.code === "protected_path_changed"));
});
