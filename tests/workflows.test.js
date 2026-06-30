import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("dogfood workflow writes action scorecard output to job summary", () => {
  const workflow = readFileSync(new URL("../.github/workflows/agent-evidence-gate.yml", import.meta.url), "utf8");

  assert.match(workflow, /id: evidence/);
  assert.match(workflow, /SCORECARD_PATH: \$\{\{ steps\.evidence\.outputs\.scorecard-path \}\}/);
  assert.match(workflow, /cat "\$SCORECARD_PATH" >> "\$GITHUB_STEP_SUMMARY"/);
});