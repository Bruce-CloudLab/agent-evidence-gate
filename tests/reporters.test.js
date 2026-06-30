import test from "node:test";
import assert from "node:assert/strict";
import { formatScorecard } from "../src/reporters.js";

test("formatScorecard shows touched paths for rename-style diffs", () => {
  const output = formatScorecard(
    {
      status: "not_ready",
      score: 85,
      threshold: 80,
      blocking: [{ code: "protected_path_changed", message: "Protected paths changed without approval." }],
      warnings: [],
      passed: [],
      metadata: {
        changedFiles: ["ci.yml"],
        touchedFiles: [".github/workflows/ci.yml", "ci.yml"]
      }
    },
    "markdown"
  );

  assert.match(output, /## Changed Files\n- `ci\.yml`/);
  assert.match(output, /## Touched Paths\n- `\.github\/workflows\/ci\.yml`\n- `ci\.yml`/);
});
