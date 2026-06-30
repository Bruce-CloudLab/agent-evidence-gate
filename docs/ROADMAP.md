# Roadmap

Agent Evidence Gate v0.1 is intentionally small: a deterministic CLI plus a GitHub Action wrapper. The next steps should keep that shape and make the tool easier for maintainers to adopt.

## v0.2

- Add first-party PR comment output using the existing Markdown scorecard.
- Improve report detail for risky changes without changing the CLI contract.
- Add more evidence examples for common test runners while keeping failure-first evidence checks.
- Prepare GitHub Marketplace packaging notes and screenshots.

## v0.3

- Add policy presets for strict, standard, and light agent-review workflows.
- Document monorepo patterns for multiple policy files.
- Add more CI examples for checkout modes, forks, and protected-path approval.
- Improve JSON output examples for teams that want to build custom dashboards.

## Later

- Optional integrations with review bots or issue triage tools.
- Optional deterministic CI-log adapters if they can preserve the same trust boundaries.
- More language-specific examples for Python, Go, Rust, and JavaScript projects.

## Non-Goals

- No model-based scoring in the core gate.
- No approval from PR-controlled text.
- No hidden network calls in the CLI.
- No broad dashboard product until the small gate is useful on its own.