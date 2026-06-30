# Agent Evidence Gate Release Prep Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare Agent Evidence Gate for a public v0.1.0 MVP release after external review found no P0/P1 blockers.

**Architecture:** Keep release prep deterministic and dependency-light. Add CI around the existing npm scripts, document the release checklist, record the v0.1.0 changelog, and improve report visibility for rename-style protected path checks.

**Tech Stack:** Node.js ESM, built-in `node:test`, GitHub Actions, Markdown docs.

## Global Constraints

- Keep the MVP dependency-light and deterministic.
- Do not add model API calls in v1.
- Prefer small modules with focused tests.
- Do not claim completion without fresh command output.
- Treat `docs/superpowers/specs` and `docs/superpowers/plans` as the source of product scope.

---

### Task 1: CI Workflow

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: `npm test` and `npm run check:examples` from `package.json`.
- Produces: A GitHub Actions workflow that validates tests and the README example on push and pull request.

- [ ] **Step 1:** Create `.github/workflows/ci.yml` with checkout, Node.js 20 setup, `npm test`, and `npm run check:examples`.
- [ ] **Step 2:** Verify the workflow YAML is static and contains no untrusted shell interpolation.

### Task 2: Release Documents

**Files:**
- Create: `CHANGELOG.md`
- Create: `docs/RELEASE_CHECKLIST.md`

**Interfaces:**
- Consumes: external review results and the existing README release boundary.
- Produces: Human release notes and a concrete v0.1.0 checklist.

- [ ] **Step 1:** Add `CHANGELOG.md` with v0.1.0 MVP capabilities and trust-boundary hardening notes.
- [ ] **Step 2:** Add `docs/RELEASE_CHECKLIST.md` with local validation, external review, GitHub Action smoke test, tagging, and post-release checks.

### Task 3: Rename Report Visibility

**Files:**
- Modify: `src/checks.js`
- Modify: `src/reporters.js`
- Modify: `tests/checks.test.js`

**Interfaces:**
- Consumes: `parseUnifiedDiff(...).touchedFiles`.
- Produces: Scorecard metadata that exposes touched old/new paths for reviewer-facing reports.

- [ ] **Step 1:** Add `touchedFiles` to `scorecard.metadata`.
- [ ] **Step 2:** Add a Markdown `Touched Paths` section when touched paths differ from changed files.
- [ ] **Step 3:** Add a focused test that rename-style protected path reports include the old protected path in metadata.

### Task 4: Validation and Commit

**Files:**
- Verify all touched files.

**Interfaces:**
- Consumes: all changes from Tasks 1-3.
- Produces: A clean working tree commit ready for external release prep review.

- [ ] **Step 1:** Run `node --test`.
- [ ] **Step 2:** Run `npm run check:examples`.
- [ ] **Step 3:** Run a manual rename reproduction and confirm `not_ready`.
- [ ] **Step 4:** Commit with message `chore: prepare v0.1.0 release`.
