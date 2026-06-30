import { parseContract } from "./contract.js";
import { parseUnifiedDiff } from "./diff.js";
import { globMatches, includesText, normalizePath } from "./match.js";

const COMPLETION_CLAIM = /\b(done|fixed|complete|completed|resolved|ready|implemented)\b/i;
const FAILURE_EVIDENCE =
  /(?:\bexit code\s+[1-9]\d*\b|# fail\s+[1-9]\d*\b|\b[1-9]\d*\s+fail(?:ed|ures?)\b|\bfail(?:ed|ures?):\s*[1-9]\d*\b)/i;
const SUCCESS_EVIDENCE =
  /(?:\bexit code\s+0\b|\b0\s+fail(?:ed|ures?)\b|# fail\s+0\b|\bfail(?:ed|ures?):\s*0\b|\btests?:\s+\d+\s+passed\b|\ball tests pass(?:ed)?\b)/i;

export function runCheck({
  agentsText = "",
  diffText = "",
  evidenceText = "",
  prBodyText = "",
  threshold,
  allowProtectedPaths = false,
  policyPath = "AGENTS.md"
} = {}) {
  const contract = parseContract(agentsText);
  protectPolicyPath(contract, policyPath);
  const effectiveThreshold = Number.isInteger(threshold) ? threshold : contract.minScore;
  const parsedDiff = parseUnifiedDiff(diffText);
  const scorecard = {
    status: "ready",
    score: 100,
    threshold: effectiveThreshold,
    blocking: [],
    warnings: [],
    passed: [],
    metadata: {
      changedFiles: parsedDiff.changedFiles,
      requiredEvidence: contract.requiredEvidence,
      mustRun: contract.mustRun,
      protectedPaths: contract.protectedPaths
    }
  };

  checkEvidence(contract, evidenceText, scorecard);
  checkMustRun(contract, evidenceText, scorecard);
  checkFailureEvidence(evidenceText, scorecard);
  checkProtectedPaths(contract, parsedDiff, allowProtectedPaths, scorecard);
  checkForbiddenAddedPatterns(contract, parsedDiff, scorecard);
  checkScope(contract, parsedDiff, scorecard);
  checkCompletionClaims(contract, evidenceText, prBodyText, scorecard);

  if (scorecard.score < effectiveThreshold || scorecard.blocking.length > 0) {
    scorecard.status = "not_ready";
  }

  return scorecard;
}

function checkFailureEvidence(evidenceText, scorecard) {
  if (hasFailureEvidence(evidenceText)) {
    block(scorecard, "failing_evidence", "Evidence contains a failed verification signal.", 30);
    return;
  }

  pass(scorecard, "no_failing_evidence", "Evidence does not contain known failure signals.");
}

function protectPolicyPath(contract, policyPath) {
  const normalizedPolicyPath = normalizePath(policyPath || "AGENTS.md");
  if (!normalizedPolicyPath) {
    return;
  }

  contract.protectedPaths = [...new Set([...contract.protectedPaths, normalizedPolicyPath])];
}

function checkEvidence(contract, evidenceText, scorecard) {
  for (const evidence of contract.requiredEvidence) {
    if (hasEvidence(evidence, evidenceText)) {
      pass(scorecard, "evidence_present", `Evidence includes required '${evidence}' signal.`);
    } else {
      block(scorecard, "missing_evidence", `Missing required '${evidence}' evidence.`, 25);
    }
  }
}

function checkMustRun(contract, evidenceText, scorecard) {
  if (contract.mustRun.length === 0) {
    warn(scorecard, "no_required_commands", "No required commands are defined in AGENTS.md.", 0);
    return;
  }

  for (const command of contract.mustRun) {
    if (includesText(evidenceText, command)) {
      pass(scorecard, "required_command_present", `Evidence includes required command: ${command}`);
    } else {
      block(scorecard, "missing_required_command", `Evidence does not include required command: ${command}`, 20);
    }
  }
}

function checkProtectedPaths(contract, parsedDiff, allowProtectedPaths, scorecard) {
  if (contract.protectedPaths.length === 0) {
    pass(scorecard, "no_protected_path_changes", "No protected path rules are configured.");
    return;
  }

  const changedProtectedFiles = parsedDiff.changedFiles.filter((file) =>
    contract.protectedPaths.some((pattern) => globMatches(pattern, file))
  );

  if (changedProtectedFiles.length === 0) {
    pass(scorecard, "no_protected_path_changes", "No protected paths changed.");
    return;
  }

  if (allowProtectedPaths) {
    warn(
      scorecard,
      "protected_path_approved",
      `Protected paths changed with maintainer-controlled approval: ${changedProtectedFiles.join(", ")}`,
      5
    );
    return;
  }

  block(
    scorecard,
    "protected_path_changed",
    `Protected paths changed without approval: ${changedProtectedFiles.join(", ")}`,
    15
  );
}

function checkForbiddenAddedPatterns(contract, parsedDiff, scorecard) {
  const matches = [];

  for (const addedLine of parsedDiff.addedLines) {
    for (const pattern of contract.forbiddenAddedPatterns) {
      if (includesText(addedLine.text, pattern, { caseSensitive: true })) {
        matches.push(`${addedLine.file}: ${pattern}`);
      }
    }
  }

  if (matches.length === 0) {
    pass(scorecard, "no_forbidden_added_patterns", "No forbidden patterns were added.");
    return;
  }

  block(scorecard, "forbidden_added_pattern", `Forbidden added patterns found: ${matches.join("; ")}`, 15);
}

function checkScope(contract, parsedDiff, scorecard) {
  if (parsedDiff.changedFiles.length === 0) {
    warn(scorecard, "empty_diff", "No changed files were found in the diff.", 5);
    return;
  }

  if (parsedDiff.changedFiles.length > contract.maxChangedFiles) {
    warn(
      scorecard,
      "large_diff",
      `Diff changes ${parsedDiff.changedFiles.length} files, above max_changed_files ${contract.maxChangedFiles}.`,
      10
    );
    return;
  }

  pass(scorecard, "scope_within_limit", `Diff changes ${parsedDiff.changedFiles.length} file(s), within scope limit.`);
}

function checkCompletionClaims(contract, evidenceText, prBodyText, scorecard) {
  const combined = `${evidenceText}\n${prBodyText}`;
  if (!COMPLETION_CLAIM.test(combined)) {
    pass(scorecard, "no_unproven_completion_claims", "No strong completion claim detected.");
    return;
  }

  const hasRequiredCommand = contract.mustRun.some((command) => includesText(evidenceText, command));
  const hasCommandEvidence = hasSuccessfulCommandEvidence(evidenceText);

  if ((contract.mustRun.length === 0 || hasRequiredCommand) && hasCommandEvidence) {
    pass(scorecard, "completion_claim_has_evidence", "Completion claim is backed by command evidence.");
    return;
  }

  block(scorecard, "completion_claim_without_evidence", "Completion claim found without command evidence.", 10);
}

function hasEvidence(kind, evidenceText) {
  if (!evidenceText.trim()) {
    return false;
  }

  if (kind.toLowerCase() === "test") {
    return /\b(test|tests|node --test|npm test|pytest|vitest|jest)\b/i.test(evidenceText) && hasSuccessfulCommandEvidence(evidenceText);
  }

  return includesText(evidenceText, kind);
}

function hasSuccessfulCommandEvidence(evidenceText) {
  return SUCCESS_EVIDENCE.test(evidenceText) && !hasFailureEvidence(evidenceText);
}

function hasFailureEvidence(evidenceText) {
  return FAILURE_EVIDENCE.test(evidenceText);
}

function pass(scorecard, code, message) {
  scorecard.passed.push({ code, message });
}

function warn(scorecard, code, message, deduction) {
  scorecard.warnings.push({ code, message });
  deduct(scorecard, deduction);
}

function block(scorecard, code, message, deduction) {
  scorecard.blocking.push({ code, message });
  deduct(scorecard, deduction);
}

function deduct(scorecard, amount) {
  scorecard.score = Math.max(0, scorecard.score - amount);
}
