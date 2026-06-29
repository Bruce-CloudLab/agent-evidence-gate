import test from "node:test";
import assert from "node:assert/strict";
import { globMatches, includesText, normalizePath } from "../src/match.js";

test("normalizePath uses slash separators", () => {
  assert.equal(normalizePath(".\\src\\index.js"), "src/index.js");
});

test("globMatches supports single star", () => {
  assert.equal(globMatches("src/*.js", "src/index.js"), true);
  assert.equal(globMatches("src/*.js", "src/nested/index.js"), false);
});

test("globMatches supports double star", () => {
  assert.equal(globMatches(".github/**", ".github/workflows/ci.yml"), true);
  assert.equal(globMatches("scripts/deploy/**", "scripts/deploy/prod/release.sh"), true);
});

test("includesText can be case-insensitive or case-sensitive", () => {
  assert.equal(includesText("Node --Test", "node --test"), true);
  assert.equal(includesText("Console.Log", "console.log", { caseSensitive: true }), false);
});
