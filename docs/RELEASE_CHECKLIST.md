# Release Checklist

Use this checklist before publishing Agent Evidence Gate v0.1.0.

## Local Validation

- [ ] Run `node --test` and confirm all tests pass.
- [ ] Run `npm run check:examples` and confirm the README example returns `Status: Ready` and `Score: 100/100`.
- [ ] Run a protected-path rename reproduction and confirm it returns `not_ready`.
- [ ] Run a failing-evidence reproduction and confirm it returns `not_ready`.
- [ ] Confirm `git status --short` is clean before tagging.

## External Review

- [ ] Ask an external AI reviewer to use `outputs/external-review-prompt.md`.
- [ ] Confirm the review reports no P0 launch blockers.
- [ ] Confirm any P1 findings are fixed or explicitly deferred before public release.

## GitHub Smoke Test

Use `docs/GITHUB_SMOKE_TEST.md` for the exact pull request scenarios.

- [ ] Push the repository to GitHub.
- [ ] Open a test pull request that changes a safe source file and includes passing evidence.
- [ ] Confirm the provided GitHub Action reads policy from the pull request base SHA.
- [ ] Open a test pull request that changes or renames `AGENTS.md` and confirm the gate fails.
- [ ] Open a test pull request that renames `.github/workflows/ci.yml` to `ci.yml` and confirm the gate fails.

## Release

- [ ] Create tag `v0.1.0` from the reviewed commit.
- [ ] Publish release notes from `CHANGELOG.md`.
- [ ] Re-run the GitHub Action on the tagged release or a post-release test PR.
- [ ] Update README links if the final GitHub repository path differs from examples.