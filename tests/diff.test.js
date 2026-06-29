import test from "node:test";
import assert from "node:assert/strict";
import { parseUnifiedDiff } from "../src/diff.js";

test("parseUnifiedDiff extracts changed files and added lines", () => {
  const diff = `diff --git a/src/index.js b/src/index.js
index 1111111..2222222 100644
--- a/src/index.js
+++ b/src/index.js
@@ -1,2 +1,3 @@
 const value = 1;
+console.log(value);
+export const next = 2;
`;

  const parsed = parseUnifiedDiff(diff);

  assert.deepEqual(parsed.changedFiles, ["src/index.js"]);
  assert.deepEqual(
    parsed.addedLines.map((line) => line.text),
    ["console.log(value);", "export const next = 2;"]
  );
});

test("parseUnifiedDiff handles new files with plus path", () => {
  const diff = `diff --git a/docs/readme.md b/docs/readme.md
new file mode 100644
--- /dev/null
+++ b/docs/readme.md
@@ -0,0 +1 @@
+hello
`;

  const parsed = parseUnifiedDiff(diff);

  assert.deepEqual(parsed.changedFiles, ["docs/readme.md"]);
  assert.equal(parsed.addedLines[0].file, "docs/readme.md");
});
