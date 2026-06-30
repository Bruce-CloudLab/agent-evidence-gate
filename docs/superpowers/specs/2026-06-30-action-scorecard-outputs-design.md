# Action Scorecard Outputs Design

## Goal

Expose the GitHub Action scorecard as reusable outputs so a workflow owner can post or store the report without changing the core CLI contract.

## Recommended Scope

For this slice, the Action should generate scorecard artifacts and outputs, but it should not post a pull request comment itself. Automatic commenting needs write permissions and fork handling, so it belongs behind a separate explicit design.

## Behavior

- The Action continues to pass when the scorecard status is `ready` and fail when the status is `not_ready`.
- The Action writes both Markdown and JSON scorecards to files under `$RUNNER_TEMP`.
- The Action exposes:
  - `status`: `ready` or `not_ready`.
  - `score`: numeric score from the JSON scorecard.
  - `scorecard-markdown`: Markdown scorecard body.
  - `scorecard-json`: JSON scorecard body.
  - `scorecard-path`: path to the Markdown scorecard file.
- Output generation must work even when the gate result is not ready. The final step may fail the Action after outputs are set.
- No new runtime dependencies are introduced.
- The CLI remains unchanged.

## Trust Boundaries

- Keep the existing trusted base policy behavior: read policy from the pull request base SHA for PR events.
- Keep protected path approval maintainer-controlled through `allow-protected-paths`.
- Do not add GitHub write permissions or direct comment posting in this slice.
- Do not interpolate PR body text into shell scripts beyond the existing environment-variable pattern.

## Testing

- Unit-test the Action manifest for the new output names and step structure.
- Unit-test that the Action captures the gate exit code before failing, so outputs can be written on not-ready results.
- Keep existing CLI and reporter tests unchanged unless implementation reveals a narrow gap.
- Verify with `node --test`, the README example, package dry-run, and this project's own evidence gate.

## Documentation

Update the README Action section with a short example showing how a downstream step can read `steps.evidence.outputs.scorecard-markdown`.
