# AGENTS.md

## Project Guidance

- Keep the MVP dependency-light and deterministic.
- Do not add model API calls in v1.
- Prefer small modules with focused tests.
- Do not claim completion without fresh command output.
- Treat `docs/superpowers/specs` and `docs/superpowers/plans` as the source of product scope.

## Agent Evidence Gate

```agent-evidence
must_run: node --test
protected_path: .github/**
protected_path: action.yml
protected_path: scripts/deploy/**
forbid_added_pattern: console.log
forbid_added_pattern: debugger
forbid_added_pattern: TODO
require_evidence: test
max_changed_files: 25
min_score: 80
```
