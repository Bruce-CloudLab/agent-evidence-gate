# Action Scorecard Outputs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add GitHub Action outputs for reusable Markdown and JSON scorecards without changing the CLI contract.

**Architecture:** Keep `bin/agent-evidence-gate.js check` as the only scoring engine. The composite Action will run the gate twice, once for Markdown and once for JSON, capture the JSON result for structured outputs, write both reports to `$RUNNER_TEMP`, set `$GITHUB_OUTPUT`, then exit with the captured Markdown check status.

**Tech Stack:** Node.js 20, composite GitHub Action YAML, Bash, `node:test`.

## Global Constraints

- Keep the MVP dependency-light and deterministic.
- Do not add model API calls in v1.
- Prefer small modules with focused tests.
- Do not claim completion without fresh command output.
- Protected path changes require maintainer-controlled approval.

---

### Task 1: Lock Action Output Contract With Tests

**Files:**
- Modify: `tests/action.test.js`
- Read: `action.yml`

**Interfaces:**
- Consumes: Action manifest text from `action.yml`.
- Produces: Tests that require `status`, `score`, `scorecard-markdown`, `scorecard-json`, and `scorecard-path` outputs.

- [ ] **Step 1: Add manifest output tests**

Add tests that assert the output names exist, the gate step has an `id`, the Action writes to `$GITHUB_OUTPUT`, and the final failure happens after output generation.

- [ ] **Step 2: Run the focused test**

Run: `node --test tests/action.test.js`

Expected: FAIL until `action.yml` exposes outputs and capture/finalize steps.

### Task 2: Implement Action Output Capture

**Files:**
- Modify: `action.yml`

**Interfaces:**
- Consumes: Existing inputs `agents-path`, `evidence-path`, `format`, `threshold`, and `allow-protected-paths`.
- Produces: Composite Action outputs mapped from `steps.run-gate.outputs.*`.

- [ ] **Step 1: Add top-level outputs**

Add `outputs:` entries for `status`, `score`, `scorecard-markdown`, `scorecard-json`, and `scorecard-path`.

- [ ] **Step 2: Split gate execution from final failure**

Give the gate step `id: run-gate`, run Markdown and JSON commands with `set +e`, capture the Markdown exit code, write reports to `$RUNNER_TEMP`, set `$GITHUB_OUTPUT`, and exit `0` from that step.

- [ ] **Step 3: Add final status step**

Add a final Bash step that exits with the captured gate exit code after outputs have been written.

### Task 3: Document Downstream Usage

**Files:**
- Modify: `README.md`
- Modify: `docs/ROADMAP.md`

**Interfaces:**
- Consumes: New Action outputs from Task 2.
- Produces: A README example with `id: evidence` and `steps.evidence.outputs.scorecard-markdown`.

- [ ] **Step 1: Update README Action example**

Add `id: evidence` to the Action step and include a small downstream shell example that writes the Markdown output to the step summary.

- [ ] **Step 2: Update roadmap**

Mark first-party PR comment output as a future wrapper around the new reusable Action outputs, not the first v0.2 step.

### Task 4: Verify and Publish

**Files:**
- Modify: test evidence files only if local gate execution needs temporary files, then remove them before commit.

**Interfaces:**
- Consumes: All staged changes.
- Produces: A pushed commit on `main`.

- [ ] **Step 1: Run tests**

Run: `node --test`

Expected: all tests pass.

- [ ] **Step 2: Run README example**

Run: `npm run check:examples`

Expected: `Status: Ready` and `Score: 100/100`.

- [ ] **Step 3: Run package dry-run**

Run: `npm pack --dry-run --json`

Expected: package still includes the Action, CLI, source, examples, README, license, and changelog.

- [ ] **Step 4: Run project gate**

Run the staged diff through `agent-evidence-gate` with `--allow-protected-paths`, because `action.yml` is a protected path and this is a maintainer-controlled change.

Expected: `Status: Ready` and no blocking issues.

- [ ] **Step 5: Commit and push**

Commit message: `feat: expose action scorecard outputs`
