# Changelog

## 0.2.0 - 2026-06-30

### Added

- GitHub Action outputs for `status`, `score`, `scorecard-markdown`, `scorecard-json`, and `scorecard-path`.
- Dogfood workflow summary step that writes the action scorecard to the GitHub job summary.
- Documentation for using the reusable scorecard output from trusted workflows.

### Security and Trust Boundaries

- The Action still fails not-ready checks only after writing outputs, so downstream `if: always()` steps can inspect the scorecard.
- Scorecard output generation keeps the trusted base policy source, maintainer-controlled protected path approval, and PR body environment-variable handling from v0.1.0.
## 0.1.0 - 2026-06-30

Initial public MVP for Agent Evidence Gate.

### Added

- Deterministic CLI for checking agent-delivered diffs against an `agent-evidence` policy block.
- GitHub Action wrapper that evaluates pull request evidence with a trusted base-branch policy file.
- Policy rules for required commands, required evidence, protected paths, forbidden added patterns, changed-file limits, and minimum score.
- Text, Markdown, and JSON scorecard output.
- Example AGENTS policy, diff, evidence, and PR body fixtures.
- CI workflow for the test suite and README example.

### Security and Trust Boundaries

- Protected path approval is maintainer-controlled only; PR body and evidence text cannot self-approve protected changes.
- Pull request policy is read from the immutable base SHA instead of the PR checkout.
- `--policy-path` preserves the real repository policy path when `--agents` points to a trusted temporary policy file.
- PR body handling in the GitHub Action uses an environment variable and `printf`, avoiding heredoc interpolation.
- Failure evidence takes precedence over success-looking lines.
- Vague success text such as `ok`, `success`, and `looks ok` is not enough evidence.
- Rename-style diffs are checked against both old and new paths for protected path rules.
