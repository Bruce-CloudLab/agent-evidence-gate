# Agent Evidence Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dependency-light CLI and GitHub Action that verifies whether agent-generated work has enough evidence for human review.

**Architecture:** The CLI reads `AGENTS.md`, a unified diff, evidence notes, and an optional PR body, then produces a deterministic readiness scorecard. Core logic is split into parser, matcher, checker, reporter, and CLI modules so each part can be tested independently.

**Tech Stack:** Node.js 20+ ESM, built-in `node:test`, no runtime dependencies.

## Global Constraints

- Runtime must work with Node.js 20 or newer.
- Do not require network access for normal checks.
- Do not call model APIs in v1.
- Keep all scoring deterministic and explainable.
- Prefer Windows-safe commands in docs and tests.
- Default passing score is 80.

---

## File Structure

- `package.json`: package metadata, bin entry, and test scripts.
- `bin/agent-evidence-gate.js`: executable entry point.
- `src/contract.js`: parse `agent-evidence` policy blocks and defaults.
- `src/diff.js`: parse unified diffs.
- `src/match.js`: simple glob and text matching helpers.
- `src/checks.js`: scorecard rules and `runCheck` API.
- `src/reporters.js`: JSON, text, and Markdown output.
- `src/cli.js`: CLI argument parsing, file IO, exit code behavior.
- `tests/*.test.js`: unit and CLI tests.
- `examples/*`: sample `AGENTS.md`, diff, evidence, and PR body.
- `action.yml`: composite GitHub Action wrapper.
- `README.md`: quickstart, examples, and positioning.
- `outputs/external-review-prompt.md`: prompt the user can paste into another AI review chat.

## Task 1: Project Scaffold and Contract Parser

**Files:**
- Create: `package.json`
- Create: `bin/agent-evidence-gate.js`
- Create: `src/contract.js`
- Create: `tests/contract.test.js`

**Interfaces:**
- Produces: `parseContract(markdown: string): EvidenceContract`
- Produces: `defaultContract(): EvidenceContract`

- [ ] **Step 1: Write failing contract parser tests**

Create tests for parsing repeated keys, numeric values, defaults, and missing blocks.

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/contract.test.js`

- [ ] **Step 3: Implement package metadata, bin stub, and contract parser**

Implement a fenced `agent-evidence` block parser using line-based parsing.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/contract.test.js`

## Task 2: Diff Parser and Match Helpers

**Files:**
- Create: `src/diff.js`
- Create: `src/match.js`
- Create: `tests/diff.test.js`
- Create: `tests/match.test.js`

**Interfaces:**
- Produces: `parseUnifiedDiff(diffText: string): ParsedDiff`
- Produces: `globMatches(pattern: string, value: string): boolean`

- [ ] **Step 1: Write failing tests for changed files, added lines, and globs**

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/diff.test.js tests/match.test.js`

- [ ] **Step 3: Implement diff parsing and glob matching**

Support `*`, `**`, and `/` path normalization.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/diff.test.js tests/match.test.js`

## Task 3: Scorecard Checks

**Files:**
- Create: `src/checks.js`
- Create: `tests/checks.test.js`

**Interfaces:**
- Produces: `runCheck({ agentsText, diffText, evidenceText, prBodyText, threshold }): Scorecard`

- [ ] **Step 1: Write failing tests for pass and fail scenarios**

Cover missing evidence, required command missing, protected path changed, forbidden added pattern, and successful score.

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/checks.test.js`

- [ ] **Step 3: Implement deterministic scoring**

Use blocking issues for missing required evidence, missing required commands, protected path changes without approval, forbidden added patterns, and completion claims without command evidence.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/checks.test.js`

## Task 4: Reporters and CLI

**Files:**
- Create: `src/reporters.js`
- Create: `src/cli.js`
- Create: `tests/cli.test.js`

**Interfaces:**
- Produces: `formatScorecard(scorecard, format): string`
- Produces: `main(argv, io): Promise<number>`

- [ ] **Step 1: Write failing tests for JSON, Markdown, text, and CLI exit codes**

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/cli.test.js`

- [ ] **Step 3: Implement reporters and CLI argument parsing**

Support `check`, `init`, `--agents`, `--diff`, `--evidence`, `--pr-body`, `--format`, `--threshold`, and `--write`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/cli.test.js`

## Task 5: GitHub Action, Examples, and README

**Files:**
- Create: `action.yml`
- Create: `examples/AGENTS.md`
- Create: `examples/diff.patch`
- Create: `examples/evidence.md`
- Create: `examples/pr-body.md`
- Create: `README.md`
- Create: `outputs/external-review-prompt.md`

**Interfaces:**
- Produces: documented local and GitHub Action workflows.

- [ ] **Step 1: Add example files with one passing scenario**

- [ ] **Step 2: Add composite GitHub Action**

The action generates a PR diff and runs the CLI through `GITHUB_ACTION_PATH`.

- [ ] **Step 3: Write README quickstart**

Explain the product for non-experts, show local CLI, GitHub Action, and scorecard output.

- [ ] **Step 4: Run full verification**

Run: `node --test`

Run: `node bin/agent-evidence-gate.js check --agents examples/AGENTS.md --diff examples/diff.patch --evidence examples/evidence.md --pr-body examples/pr-body.md --format markdown`

Expected: exit code `0` and a passing readiness report.

## Self-Review

- Spec coverage: tasks cover contract parsing, diff parsing, checks, CLI, action, examples, README, and external review prompt.
- Placeholder scan: no implementation task depends on undefined external services or future model APIs.
- Type consistency: `EvidenceContract`, `ParsedDiff`, and `Scorecard` are produced by the modules named above and consumed by later tasks.
