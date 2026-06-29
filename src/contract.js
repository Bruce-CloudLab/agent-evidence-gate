const BLOCK_START = /^```agent-evidence\s*$/i;
const BLOCK_END = /^```\s*$/;

const DEFAULT_CONTRACT = Object.freeze({
  mustRun: [],
  protectedPaths: [],
  forbiddenAddedPatterns: ["console.log", "debugger", "TODO", "FIXME"],
  requiredEvidence: ["test"],
  maxChangedFiles: 25,
  minScore: 80,
  approvalPhrase: "approved protected path"
});

export function defaultContract() {
  return {
    mustRun: [...DEFAULT_CONTRACT.mustRun],
    protectedPaths: [...DEFAULT_CONTRACT.protectedPaths],
    forbiddenAddedPatterns: [...DEFAULT_CONTRACT.forbiddenAddedPatterns],
    requiredEvidence: [...DEFAULT_CONTRACT.requiredEvidence],
    maxChangedFiles: DEFAULT_CONTRACT.maxChangedFiles,
    minScore: DEFAULT_CONTRACT.minScore,
    approvalPhrase: DEFAULT_CONTRACT.approvalPhrase
  };
}

export function parseContract(markdown = "") {
  const contract = defaultContract();
  const block = extractEvidenceBlock(markdown);

  if (!block) {
    return contract;
  }

  for (const rawLine of block.split(/\r?\n/)) {
    const line = stripInlineComment(rawLine).trim();
    if (!line) {
      continue;
    }

    const match = line.match(/^([A-Za-z0-9_-]+)\s*[:=]\s*(.+)$/);
    if (!match) {
      continue;
    }

    const key = normalizeKey(match[1]);
    const value = unquote(match[2].trim());

    if (!value) {
      continue;
    }

    switch (key) {
      case "mustrun":
        contract.mustRun.push(value);
        break;
      case "protectedpath":
        contract.protectedPaths.push(value);
        break;
      case "forbidaddedpattern":
        contract.forbiddenAddedPatterns.push(value);
        break;
      case "requireevidence":
        contract.requiredEvidence.push(value);
        break;
      case "maxchangedfiles":
        contract.maxChangedFiles = parsePositiveInteger(value, contract.maxChangedFiles);
        break;
      case "minscore":
        contract.minScore = parsePositiveInteger(value, contract.minScore);
        break;
      case "approvalphrase":
        contract.approvalPhrase = value;
        break;
    }
  }

  contract.mustRun = unique(contract.mustRun);
  contract.protectedPaths = unique(contract.protectedPaths);
  contract.forbiddenAddedPatterns = unique(contract.forbiddenAddedPatterns);
  contract.requiredEvidence = unique(contract.requiredEvidence);

  return contract;
}

export function starterContractBlock() {
  return [
    "```agent-evidence",
    "must_run: node --test",
    "protected_path: .github/**",
    "protected_path: scripts/deploy/**",
    "forbid_added_pattern: console.log",
    "forbid_added_pattern: TODO",
    "require_evidence: test",
    "max_changed_files: 25",
    "min_score: 80",
    "```"
  ].join("\n");
}

export function hasEvidenceBlock(markdown = "") {
  return Boolean(extractEvidenceBlock(markdown));
}

function extractEvidenceBlock(markdown) {
  const lines = markdown.split(/\r?\n/);
  let inside = false;
  const blockLines = [];

  for (const line of lines) {
    if (!inside && BLOCK_START.test(line.trim())) {
      inside = true;
      continue;
    }

    if (inside && BLOCK_END.test(line.trim())) {
      return blockLines.join("\n");
    }

    if (inside) {
      blockLines.push(line);
    }
  }

  return "";
}

function normalizeKey(key) {
  return key.toLowerCase().replace(/[-_]/g, "");
}

function stripInlineComment(line) {
  const index = line.indexOf("#");
  return index === -1 ? line : line.slice(0, index);
}

function unquote(value) {
  return value.replace(/^["']|["']$/g, "");
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function unique(values) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
