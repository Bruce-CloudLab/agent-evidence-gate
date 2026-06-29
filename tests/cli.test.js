import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { main } from "../src/cli.js";

test("CLI init prints starter block", async () => {
  const output = createOutput();
  const exitCode = await main(["init"], testIo(process.cwd(), output));

  assert.equal(exitCode, 0);
  assert.match(output.stdout, /```agent-evidence/);
  assert.match(output.stdout, /must_run: node --test/);
});

test("CLI check returns markdown and ready exit code for valid files", async () => {
  const dir = mkdtempSync(join(tmpdir(), "aeg-"));
  writeFileSync(join(dir, "AGENTS.md"), agentsText(), "utf8");
  writeFileSync(join(dir, "diff.patch"), safeDiff(), "utf8");
  writeFileSync(join(dir, "evidence.md"), passingEvidence(), "utf8");
  writeFileSync(join(dir, "pr.md"), "Implemented and ready.", "utf8");

  const output = createOutput();
  const exitCode = await main(
    [
      "check",
      "--agents",
      "AGENTS.md",
      "--diff",
      "diff.patch",
      "--evidence",
      "evidence.md",
      "--pr-body",
      "pr.md",
      "--format",
      "markdown"
    ],
    testIo(dir, output)
  );

  assert.equal(exitCode, 0);
  assert.match(output.stdout, /Status:\*\* Ready/);
  assert.match(output.stdout, /Score:\*\* 100\/100/);
});

test("CLI check returns non-zero for missing evidence", async () => {
  const dir = mkdtempSync(join(tmpdir(), "aeg-"));
  writeFileSync(join(dir, "AGENTS.md"), agentsText(), "utf8");
  writeFileSync(join(dir, "diff.patch"), safeDiff(), "utf8");
  writeFileSync(join(dir, "evidence.md"), "", "utf8");

  const output = createOutput();
  const exitCode = await main(
    ["check", "--agents", "AGENTS.md", "--diff", "diff.patch", "--evidence", "evidence.md", "--format", "json"],
    testIo(dir, output)
  );

  assert.equal(exitCode, 1);
  const parsed = JSON.parse(output.stdout);
  assert.equal(parsed.status, "not_ready");
});

test("CLI exposes maintainer-controlled protected path approval flag", async () => {
  const dir = mkdtempSync(join(tmpdir(), "aeg-"));
  writeFileSync(join(dir, "AGENTS.md"), agentsTextWithProtectedPath(), "utf8");
  writeFileSync(join(dir, "diff.patch"), protectedDiff(), "utf8");
  writeFileSync(join(dir, "evidence.md"), passingEvidence(), "utf8");

  const output = createOutput();
  const exitCode = await main(
    [
      "check",
      "--agents",
      "AGENTS.md",
      "--diff",
      "diff.patch",
      "--evidence",
      "evidence.md",
      "--allow-protected-paths",
      "--format",
      "json"
    ],
    testIo(dir, output)
  );

  assert.equal(exitCode, 0);
  const parsed = JSON.parse(output.stdout);
  assert.equal(parsed.status, "ready");
  assert.ok(parsed.warnings.some((issue) => issue.code === "protected_path_approved"));
});

function testIo(cwd, output) {
  return {
    cwd: () => cwd,
    exists: (path) => {
      try {
        readFileSync(path);
        return true;
      } catch {
        return false;
      }
    },
    readFile: (path) => readFileSync(path, "utf8"),
    writeFile: (path, content) => writeFileSync(path, content, "utf8"),
    stdout: {
      write: (text) => {
        output.stdout += text;
      }
    },
    stderr: {
      write: (text) => {
        output.stderr += text;
      }
    }
  };
}

function createOutput() {
  return {
    stdout: "",
    stderr: ""
  };
}

function agentsText() {
  return `
\`\`\`agent-evidence
must_run: node --test
require_evidence: test
min_score: 80
\`\`\`
`;
}

function agentsTextWithProtectedPath() {
  return `
\`\`\`agent-evidence
must_run: node --test
protected_path: .github/**
require_evidence: test
min_score: 80
\`\`\`
`;
}

function safeDiff() {
  return `diff --git a/src/math.js b/src/math.js
--- a/src/math.js
+++ b/src/math.js
@@ -1 +1,2 @@
 export const add = (a, b) => a + b;
+export const subtract = (a, b) => a - b;
`;
}

function protectedDiff() {
  return `diff --git a/.github/workflows/ci.yml b/.github/workflows/ci.yml
--- a/.github/workflows/ci.yml
+++ b/.github/workflows/ci.yml
@@ -1 +1,2 @@
 name: ci
+on: push
`;
}

function passingEvidence() {
  return `node --test
# pass 4
# fail 0
exit code 0
`;
}
