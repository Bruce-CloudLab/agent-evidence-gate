# GitHub Smoke Test

Run this after the repository is pushed to GitHub for the first time.

## Prerequisites

- The repository exists on GitHub.
- The default branch contains `action.yml`, `.github/workflows/ci.yml`, and `AGENTS.md`.
- GitHub Actions are enabled for the repository.

## 1. Safe Change Should Pass

1. Create a branch from the default branch.
2. Change a safe source file, for example `src/index.js` or a new docs file.
3. Add or update an evidence file with:

```markdown
## Verification

Command:
node --test

Result:
# pass 38
# fail 0
exit code 0
```

4. Open a pull request.
5. Confirm the Agent Evidence Gate action reports `Ready` with no blocking issues.

## 2. Policy Tamper Should Fail

1. Create a branch from the default branch.
2. Change, delete, or rename `AGENTS.md`.
3. Add passing-looking evidence.
4. Open a pull request.
5. Confirm the Agent Evidence Gate action reports `Not Ready` with `protected_path_changed`.

## 3. Protected Rename Should Fail

1. Create a branch from the default branch.
2. Rename `.github/workflows/ci.yml` to `ci.yml`.
3. Add passing-looking evidence.
4. Open a pull request.
5. Confirm the Agent Evidence Gate action reports `Not Ready` with `protected_path_changed`.
6. Confirm the Markdown report shows `Touched Paths` including both `.github/workflows/ci.yml` and `ci.yml`.

## Expected Release Decision

If all three smoke tests behave as expected, the repository is ready for a `v0.1.0` public release tag.