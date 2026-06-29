# External AI Review Prompt

Please review this early open-source MVP as a product and engineering reviewer.

Project: Agent Evidence Gate

Core idea: This is not another AGENTS.md linter. It uses AGENTS.md as a policy source, but its main job is to check whether an AI coding agent's delivered work has enough evidence for human review.

Files to review:

- README.md
- docs/superpowers/specs/2026-06-30-agent-evidence-gate-design.md
- docs/superpowers/plans/2026-06-30-agent-evidence-gate.md
- src/checks.js
- src/cli.js
- action.yml
- tests/checks.test.js
- tests/cli.test.js

Please answer these questions:

1. Is the product positioning clearly different from AGENTS.md/context linters?
2. Is the MVP small enough to ship, or is it already overbuilt?
3. Are the scoring rules understandable and useful for maintainers?
4. Is there any obvious missing feature that would block a first public release?
5. Are there any serious engineering risks in the CLI or GitHub Action design?

Please give direct, prioritized feedback. Focus on launch-blocking issues first.
