# Agent Evidence Gate

Stop trusting AI coding agents just because they say "done." Agent Evidence Gate checks whether agent-generated work has enough evidence for human review.

It is not another `AGENTS.md` linter. Context linters check whether instructions are stale. Agent Evidence Gate checks whether the delivered diff and evidence actually satisfy the project contract.

Use it when AI coding agents open pull requests and you want a deterministic first gate before review. The gate reads three things: the project policy, the delivered diff, and the agent's evidence.

## What It Checks

- Required test or verification evidence is present.
- Required commands from `AGENTS.md` appear in the evidence.
- Protected paths were not changed without maintainer-controlled approval.
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

Failure signals win over success-looking lines. Evidence with `exit code 1`, `# fail 1`, or nonzero failures is blocked, and a `# pass 4` line alone is not enough proof of success.

In CI, evaluate the policy file from the trusted base branch, not from the PR-modified checkout. The provided GitHub Action does this by reading `AGENTS.md` from the pull request base SHA and passing the original policy path separately for protected-path checks.

Protected paths are blocked by default. Maintainers can allow them from a trusted workflow or local command:

Rename-style diffs are checked against both the old path and the new path, so moving a file out of a protected location is still blocked. Markdown reports show touched paths when they differ from changed files.

```bash
node bin/agent-evidence-gate.js check --agents AGENTS.md --diff agent.diff --evidence evidence.md --allow-protected-paths
```

Do not put approval phrases in PR bodies or evidence files. Those files can be controlled by the PR author.

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
      - id: evidence
        uses: Bruce-CloudLab/agent-evidence-gate@v0.2.0
        with:
          agents-path: AGENTS.md
          evidence-path: evidence.md
          format: markdown
          allow-protected-paths: "false"
      - name: Add scorecard to job summary
        if: always()
        run: |
          cat "$SCORECARD_PATH" >> "$GITHUB_STEP_SUMMARY"
        env:
          SCORECARD_PATH: ${{ steps.evidence.outputs.scorecard-path }}
```

For the MVP, the action fails or passes the check. It also exposes `status`, `score`, `scorecard-markdown`, `scorecard-json`, and `scorecard-path` outputs so workflow owners can post or store the scorecard from their own trusted workflow.

Comment posting can be added later without changing the CLI contract.

## CLI Reference

```bash
agent-evidence-gate init [--agents AGENTS.md] [--write]
agent-evidence-gate check --agents AGENTS.md --diff diff.patch --evidence evidence.md [--pr-body pr.md] [--policy-path AGENTS.md] [--format text|markdown|json] [--threshold 80] [--allow-protected-paths]
```

Use `--policy-path` when `--agents` points to a trusted temporary copy of the policy file. The checker protects the original policy path from PR tampering.

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
