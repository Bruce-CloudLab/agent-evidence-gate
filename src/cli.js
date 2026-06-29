import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { hasEvidenceBlock, starterContractBlock } from "./contract.js";
import { runCheck } from "./checks.js";
import { formatScorecard } from "./reporters.js";

const HELP = `Agent Evidence Gate

Usage:
  agent-evidence-gate init [--agents AGENTS.md] [--write]
  agent-evidence-gate check --agents AGENTS.md --diff diff.patch --evidence evidence.md [--pr-body pr.md] [--format text|markdown|json] [--threshold 80] [--allow-protected-paths]

Commands:
  init    Print or append a starter AGENTS.md evidence contract.
  check   Score agent work evidence against AGENTS.md and a diff.
`;

export async function main(argv, io = defaultIo()) {
  const command = argv[0];
  const args = parseArgs(argv.slice(1));

  try {
    if (!command || args.help || command === "help") {
      io.stdout.write(HELP);
      return 0;
    }

    if (command === "init") {
      return runInit(args, io);
    }

    if (command === "check") {
      return runCheckCommand(args, io);
    }

    io.stderr.write(`Unknown command: ${command}\n\n${HELP}`);
    return 2;
  } catch (error) {
    io.stderr.write(`${error.message}\n`);
    return 2;
  }
}

function runInit(args, io) {
  const agentsPath = resolve(io.cwd(), args.agents || "AGENTS.md");
  const block = starterContractBlock();

  if (!args.write) {
    io.stdout.write(`${block}\n`);
    return 0;
  }

  const existing = io.exists(agentsPath) ? io.readFile(agentsPath) : "";
  if (hasEvidenceBlock(existing)) {
    io.stdout.write(`${agentsPath} already contains an agent-evidence block.\n`);
    return 0;
  }

  const nextContent = existing.trim()
    ? `${existing.trimEnd()}\n\n## Agent Evidence Gate\n\n${block}\n`
    : `# AGENTS.md\n\n## Agent Evidence Gate\n\n${block}\n`;

  io.writeFile(agentsPath, nextContent);
  io.stdout.write(`Wrote starter evidence contract to ${agentsPath}\n`);
  return 0;
}

function runCheckCommand(args, io) {
  const agentsPath = requiredPath(args, "agents", io);
  const diffPath = requiredPath(args, "diff", io);
  const evidencePath = requiredPath(args, "evidence", io);
  const prBodyPath = optionalPath(args, "prBody", io);
  const threshold = args.threshold ? Number.parseInt(args.threshold, 10) : undefined;

  if (args.threshold && !Number.isInteger(threshold)) {
    throw new Error("--threshold must be an integer");
  }

  const scorecard = runCheck({
    agentsText: io.readFile(agentsPath),
    diffText: io.readFile(diffPath),
    evidenceText: io.readFile(evidencePath),
    prBodyText: prBodyPath ? io.readFile(prBodyPath) : "",
    threshold,
    allowProtectedPaths: Boolean(args.allowProtectedPaths)
  });

  io.stdout.write(formatScorecard(scorecard, args.format || "text"));
  return scorecard.status === "ready" ? 0 : 1;
}

function requiredPath(args, name, io) {
  const value = args[name];
  if (!value) {
    throw new Error(`Missing required --${toFlag(name)} path`);
  }

  const path = resolve(io.cwd(), value);
  if (!io.exists(path)) {
    throw new Error(`File not found: ${path}`);
  }

  return path;
}

function optionalPath(args, name, io) {
  if (!args[name]) {
    return "";
  }

  const path = resolve(io.cwd(), args[name]);
  if (!io.exists(path)) {
    throw new Error(`File not found: ${path}`);
  }

  return path;
}

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      throw new Error(`Unexpected argument: ${token}`);
    }

    const rawName = token.slice(2);
    const name = toCamel(rawName);

    if (name === "write" || name === "help" || name === "allowProtectedPaths") {
      args[name] = true;
      continue;
    }

    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${rawName}`);
    }

    args[name] = value;
    index += 1;
  }

  return args;
}

function defaultIo() {
  return {
    cwd: () => process.cwd(),
    exists: existsSync,
    readFile: (path) => readFileSync(path, "utf8"),
    writeFile: (path, content) => writeFileSync(path, content, "utf8"),
    stdout: process.stdout,
    stderr: process.stderr
  };
}

function toCamel(value) {
  return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function toFlag(value) {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}
