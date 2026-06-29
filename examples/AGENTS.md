# AGENTS.md

This example policy tells agents what evidence they must provide before asking for review.

```agent-evidence
must_run: node --test
protected_path: .github/**
forbid_added_pattern: console.log
forbid_added_pattern: TODO
require_evidence: test
max_changed_files: 10
min_score: 80
```
