export function normalizePath(value = "") {
  return value.replace(/\\/g, "/").replace(/^\.\/+/, "");
}

export function globMatches(pattern, value) {
  const normalizedPattern = normalizePath(pattern);
  const normalizedValue = normalizePath(value);
  const regex = globToRegExp(normalizedPattern);
  return regex.test(normalizedValue);
}

export function includesText(haystack = "", needle = "", { caseSensitive = false } = {}) {
  if (!needle) {
    return true;
  }

  if (caseSensitive) {
    return haystack.includes(needle);
  }

  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function globToRegExp(pattern) {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "\u0000")
    .replace(/\*/g, "[^/]*")
    .replace(/\u0000/g, ".*");

  return new RegExp(`^${escaped}$`);
}
