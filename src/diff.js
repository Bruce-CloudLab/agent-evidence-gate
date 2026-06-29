import { normalizePath } from "./match.js";

export function parseUnifiedDiff(diffText = "") {
  const files = [];
  let current = null;

  for (const line of diffText.split(/\r?\n/)) {
    const gitHeader = line.match(/^diff --git a\/(.+?) b\/(.+)$/);
    if (gitHeader) {
      current = createFileRecord(gitHeader[1], gitHeader[2]);
      files.push(current);
      continue;
    }

    if (line.startsWith("+++ ")) {
      const path = parseDiffPath(line.slice(4));
      if (path && path !== "/dev/null") {
        if (!current) {
          current = createFileRecord(path, path);
          files.push(current);
        }
        current.path = path;
        current.newPath = path;
      }
      continue;
    }

    if (!current) {
      continue;
    }

    if (line.startsWith("+") && !line.startsWith("+++")) {
      current.addedLines.push(line.slice(1));
    }
  }

  return {
    files,
    changedFiles: unique(files.map((file) => file.path)),
    addedLines: files.flatMap((file) =>
      file.addedLines.map((text) => ({
        file: file.path,
        text
      }))
    )
  };
}

function createFileRecord(oldPath, newPath) {
  const normalizedNewPath = normalizePath(newPath);
  return {
    path: normalizedNewPath,
    oldPath: normalizePath(oldPath),
    newPath: normalizedNewPath,
    addedLines: []
  };
}

function parseDiffPath(rawPath) {
  const withoutPrefix = rawPath.trim().replace(/^[ab]\//, "");
  if (withoutPrefix === "/dev/null") {
    return withoutPrefix;
  }
  return normalizePath(withoutPrefix);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}
