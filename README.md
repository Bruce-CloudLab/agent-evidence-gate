# Agent Evidence Gate

Stop trusting AI coding agents just because they say "done." Agent Evidence Gate checks whether agent-generated work has enough evidence for human review.

It is not another `AGENTS.md` linter. Context linters check whether instructions are stale. Agent Evidence Gate checks whether the delivered diff and evidence actually satisfy the project contract.

## What It Checks

- Required test or verification evidence is present.
- Required commands from `AGENTS.md` appear in the evidence.
- Protected paths were not changed without explicit approval.
- Forbidden debug leftovers were not added.
- The diff is not far larger than the project allows.
- Completion claims such as "fixed" or "ready" are backed by command evidence.

The output is a simple scorecard: `Ready` or `Not Ready`.

## Quick Start

Run the example check from this repository:

```bash
node bin/agent-evidence-gate.js check --agents examples/AGENTS.md --diff examples/diff.patch --evidence examples/evidence.md --pr-body examples/pr-body.md --format markdown
```

Expected result: `Status: Ready` and `Score: 100/100`.

## Add a Policy to AGENTS.md

Print a starter policy block:

```bash
node bin/agent-evidence-gate.js init
```

Append it to `AGENTS.md`:

```bash
node bin/agent-evidence-gate.js init --write
```

The policy block looks like this:

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

## Check a Real Change

Create a diff:

```bash
git diff --unified=0 main...HEAD > agent.diff
```

Create an evidence file, for example `evidence.md`:

```markdown
## Verification

Command:
node --test

Result:
# pass 17
# fail 0
exit code 0
```

Run the gate:

```bash
node bin/agent-evidence-gate.js check --agents AGENTS.md --diff agent.diff --evidence evidence.md --format markdown
```

The command exits with code `0` only when the work is ready.

## GitHub Action

Add `.github/workflows/agent-evidence-gate.yml`:

```yaml
name: Agent Evidence Gate

on:
  pull_request:
    types: [opened, edited, synchronize, reopened]

jobs:
  evidence:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: your-org/agent-evidence-gate@v0.1.0
        with:
          agents-path: AGENTS.md
          evidence-path: evidence.md
          format: markdown
```

For the MVP, the action fails or passes the check. Comment posting can be added later without changing the CLI contract.

## CLI Reference

```bash
agent-evidence-gate init [--agents AGENTS.md] [--write]
agent-evidence-gate check --agents AGENTS.md --diff diff.patch --evidence evidence.md [--pr-body pr.md] [--format text|markdown|json] [--threshold 80]
```

## Why This Exists

AI-generated pull requests often look complete but miss the boring parts humans rely on: test logs, scoped changes, removed debug output, and clear approval for risky files. This project gives maintainers a cheap first gate before review.

The philosophy is simple:

> Evidence before claims.

## Development

Run tests:

```bash
node --test
```

Run the example:

```bash
node bin/agent-evidence-gate.js check --agents examples/AGENTS.md --diff examples/diff.patch --evidence examples/evidence.md --pr-body examples/pr-body.md --format markdown
```
