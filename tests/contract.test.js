import test from "node:test";
import assert from "node:assert/strict";
import { defaultContract, hasEvidenceBlock, parseContract, starterContractBlock } from "../src/contract.js";

test("parseContract returns safe defaults when no block exists", () => {
  const contract = parseContract("# AGENTS.md\n\nUse tests.");

  assert.deepEqual(contract.mustRun, []);
  assert.deepEqual(contract.requiredEvidence, ["test"]);
  assert.equal(contract.minScore, 80);
  assert.equal(contract.maxChangedFiles, 25);
  assert.ok(contract.forbiddenAddedPatterns.includes("console.log"));
});

test("parseContract reads repeated keys and numbers from agent-evidence block", () => {
  const contract = parseContract(`
# AGENTS.md

\`\`\`agent-evidence
must_run: node --test
must_run: npm run lint
protected_path: .github/**
forbid_added_pattern: TODO
require_evidence: screenshot
max_changed_files: 12
min_score: 90
approval_phrase: owner approved
\`\`\`
`);

  assert.deepEqual(contract.mustRun, ["node --test", "npm run lint"]);
  assert.deepEqual(contract.protectedPaths, [".github/**"]);
  assert.ok(contract.forbiddenAddedPatterns.includes("TODO"));
  assert.ok(contract.requiredEvidence.includes("screenshot"));
  assert.equal(contract.maxChangedFiles, 12);
  assert.equal(contract.minScore, 90);
  assert.equal(contract.approvalPhrase, "owner approved");
});

test("hasEvidenceBlock detects starter block", () => {
  assert.equal(hasEvidenceBlock(starterContractBlock()), true);
  assert.equal(hasEvidenceBlock("# nothing"), false);
});

test("defaultContract returns fresh arrays", () => {
  const first = defaultContract();
  const second = defaultContract();

  first.mustRun.push("node --test");

  assert.deepEqual(second.mustRun, []);
});
