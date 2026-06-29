# External AI Review Prompt

Please review this early open-source MVP as a security, product, and engineering reviewer.

Project: Agent Evidence Gate

Core idea: This is not another AGENTS.md linter. It uses AGENTS.md as a policy source, but its main job is to check whether an AI coding agent's delivered work has enough evidence for human review.

Review context:

Prior reviews found these launch blockers:

1. Protected path approval could be self-approved from evidence or PR body.
2. GitHub Action interpolated untrusted PR body into a shell heredoc.
3. Evidence success detection was too loose, allowing text such as "looks ok".
4. GitHub Action read `AGENTS.md` from the PR checkout, so a PR could weaken or delete the policy before scoring.

These were addressed in follow-up commits. Please focus on whether the fixes really close the trust boundaries and whether any new launch blockers remain.

Files to review:

- README.md
- docs/superpowers/specs/2026-06-30-agent-evidence-gate-design.md
- docs/superpowers/plans/2026-06-30-agent-evidence-gate.md
- src/checks.js
- src/cli.js
- action.yml
- tests/checks.test.js
- tests/cli.test.js
- tests/action.test.js

Please answer these questions:

1. Does the GitHub Action read policy from the trusted pull request base SHA rather than the PR checkout?
2. If a PR changes or deletes `AGENTS.md`, does the checker still block it by default?
3. Can protected paths only be allowed by a maintainer-controlled flag? Can PR body or evidence still bypass this?
4. Does `action.yml` still have PR body shell injection or heredoc injection risk?
5. Is evidence detection strict enough? Can `looks ok`, `success`, or `ok` still pass?
6. Is no-agent-evidence-block default behavior reasonable?
7. Does GitHub Action diff generation have obvious remaining risk?
8. Is the README safety boundary clear?
9. Are there launch blockers? If yes, list them as P0/P1/P2.

Please give direct, prioritized feedback. Focus on launch-blocking issues first.
