export function formatScorecard(scorecard, format = "text") {
  if (format === "json") {
    return `${JSON.stringify(scorecard, null, 2)}\n`;
  }

  if (format === "markdown") {
    return formatMarkdown(scorecard);
  }

  return formatText(scorecard);
}

function formatMarkdown(scorecard) {
  const lines = [
    "# Agent Evidence Gate",
    "",
    `**Status:** ${scorecard.status === "ready" ? "Ready" : "Not Ready"}`,
    `**Score:** ${scorecard.score}/100`,
    `**Threshold:** ${scorecard.threshold}`,
    ""
  ];

  appendIssueSection(lines, "Blocking Issues", scorecard.blocking);
  appendIssueSection(lines, "Warnings", scorecard.warnings);
  appendIssueSection(lines, "Passed Checks", scorecard.passed);

  const changedFiles = scorecard.metadata.changedFiles || [];
  const touchedFiles = scorecard.metadata.touchedFiles || changedFiles;

  lines.push("## Changed Files");
  if (changedFiles.length === 0) {
    lines.push("- None detected");
  } else {
    for (const file of changedFiles) {
      lines.push(`- \`${file}\``);
    }
  }
  lines.push("");

  if (hasDifferentPaths(touchedFiles, changedFiles)) {
    lines.push("## Touched Paths");
    for (const file of touchedFiles) {
      lines.push(`- \`${file}\``);
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

function formatText(scorecard) {
  const lines = [
    "Agent Evidence Gate",
    `Status: ${scorecard.status === "ready" ? "Ready" : "Not Ready"}`,
    `Score: ${scorecard.score}/100`,
    `Threshold: ${scorecard.threshold}`,
    ""
  ];

  appendPlainSection(lines, "Blocking Issues", scorecard.blocking);
  appendPlainSection(lines, "Warnings", scorecard.warnings);
  appendPlainSection(lines, "Passed Checks", scorecard.passed);

  return `${lines.join("\n")}\n`;
}

function appendIssueSection(lines, title, issues) {
  lines.push(`## ${title}`);
  if (issues.length === 0) {
    lines.push("- None");
  } else {
    for (const issue of issues) {
      lines.push(`- **${issue.code}:** ${issue.message}`);
    }
  }
  lines.push("");
}

function appendPlainSection(lines, title, issues) {
  lines.push(`${title}:`);
  if (issues.length === 0) {
    lines.push("- None");
  } else {
    for (const issue of issues) {
      lines.push(`- ${issue.code}: ${issue.message}`);
    }
  }
  lines.push("");
}

function hasDifferentPaths(left, right) {
  if (left.length !== right.length) {
    return true;
  }

  return left.some((value, index) => value !== right[index]);
}
