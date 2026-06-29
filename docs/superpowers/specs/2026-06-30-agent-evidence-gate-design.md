# Agent Evidence Gate Design

## Product Position

Agent Evidence Gate is a local-first CLI and GitHub Action that checks whether an AI coding agent's output is ready for human review. It uses `AGENTS.md` as the project policy source, but the product does not compete as another `AGENTS.md` linter. The core promise is different:

> Do not trust an agent's completion claim. Verify the evidence attached to the work.

## Target Users

- Open-source maintainers receiving low-quality AI-generated pull requests.
- Small engineering teams using Codex, Claude Code, Gemini CLI, Cursor, or similar coding agents.
- Non-expert builders who need a simple "ready / not ready" gate before asking a human or another AI to review changes.

## Problem

AI coding agents can produce fast-looking work that is still unfinished: no test evidence, unapproved risky files, debug leftovers, vague PR descriptions, or claims such as "fixed" without proof. Existing context tools mostly check whether instruction files are stale or contradictory. Agent Evidence Gate checks the delivered work against a lightweight evidence contract.

## MVP Scope

The MVP is intentionally static and dependency-light:

- A Node.js CLI with no runtime package dependencies.
- A `check` command that reads:
  - an `AGENTS.md` policy file,
  - a unified diff file,
  - an evidence file containing test logs or agent handoff notes,
  - an optional PR body file.
- A deterministic scorecard with blocking issues, warnings, passed checks, and a numeric score.
- A `init` command that prints or writes a starter `AGENTS.md` evidence contract block.
- A composite GitHub Action that runs the same CLI in pull requests.
- Example files and README quickstart.

## Non-Goals

- No model API calls in v1.
- No attempt to prove semantic correctness of code.
- No replacement for tests, security scanners, or human review.
- No database, dashboard, hosted service, authentication, or billing.
- No deep AGENTS.md natural-language parser in v1.

## Evidence Contract

Projects can add a small fenced block to `AGENTS.md`:

```agent-evidence
must_run: node --test
protected_path: .github/**
protected_path: scripts/deploy/**
forbid_added_pattern: console.log
forbid_added_pattern: TODO
require_evidence: test
max_changed_files: 25
min_score: 80
```

If the block is missing, the CLI uses safe defaults:

- require test evidence,
- flag common debug leftovers,
- warn on large diffs,
- use a minimum passing score of 80.

## CLI Behavior

### `agent-evidence-gate init`

Prints a starter policy block by default. With `--write`, appends the block to `AGENTS.md` if no `agent-evidence` block exists.

### `agent-evidence-gate check`

Recommended flags:

```bash
agent-evidence-gate check \
  --agents AGENTS.md \
  --diff agent.diff \
  --evidence evidence.md \
  --pr-body pr-body.md \
  --format markdown
```

The command exits with code `0` when the score is at or above the threshold and there are no blocking issues. It exits with code `1` otherwise.

## Scorecard Rules

- Evidence presence: required evidence categories must appear.
- Must-run commands: required commands must be present in evidence.
- Protected paths: protected files changed without explicit approval are blocking.
- Forbidden added patterns: forbidden strings in added diff lines are blocking.
- Scope size: unusually large diffs produce warnings or penalties.
- Completion claims: "done", "fixed", "complete", or similar claims without command evidence are blocking.

## Architecture

- `src/contract.js`: parse the optional `agent-evidence` block from `AGENTS.md`.
- `src/diff.js`: parse unified diffs into changed files and added lines.
- `src/match.js`: match simple glob patterns without external dependencies.
- `src/checks.js`: run deterministic checks and compute score.
- `src/reporters.js`: render text, Markdown, and JSON reports.
- `src/cli.js`: parse CLI arguments and wire file IO to the checker.
- `bin/agent-evidence-gate.js`: executable entry point.

## Verification

The project uses Node's built-in test runner:

```bash
node --test
```

The MVP is accepted when:

- contract parsing is tested,
- diff parsing is tested,
- scoring is tested for both passing and failing examples,
- CLI checks run against example files,
- README quickstart works on Windows without requiring global npm setup.

## First External Review Checkpoint

Ask an external reviewer to judge whether the product positioning and MVP are distinct from existing AGENTS.md/context linters. The desired verdict is not "perfect"; it is whether the MVP has a clear wedge and can be implemented without overbuilding.
