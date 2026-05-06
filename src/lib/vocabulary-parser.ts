type ParsedRow = string[];

/**
 * Parse the raw input text into rows of cells.
 * Supports:
 * - Tab or slash separated (format 1 & 2)
 * - Markdown table (format 3)
 */
export function parseInputToRows(raw: string): ParsedRow[] {
  const lines = raw.split("\n").reduce<string[]>((acc, l) => {
    const trimmed = l.trim();
    if (trimmed.length > 0) acc.push(trimmed);
    return acc;
  }, []);

  // Detect markdown table (lines starting and ending with | or containing | separators)
  const isMarkdownTable = lines.every(
    (line) => line.startsWith("|") && line.includes("|")
  );
  if (isMarkdownTable) {
    // remove separator lines like | --- | --- |
    const filtered = lines.filter(
      (l) => !/^\|?\s*-{1,}\s*(\|\s*-{1,}\s*)+$/i.test(l)
    );
    return filtered.reduce<ParsedRow[]>((acc, line) => {
      const parts = line.split("|");
      const cells = parts.reduce<string[]>((cellAcc, c, i) => {
        const trimmed = c.trim();
        if (trimmed !== "" && !(i === 0 || i === parts.length - 1)) {
          cellAcc.push(trimmed);
        }
        return cellAcc;
      }, []);
      acc.push(cells);
      return acc;
    }, []);
  }

  // Otherwise, try splitting by tab first, then slashes, then multiple spaces
  const rows: ParsedRow[] = [];
  const tabRegex = /\t/;
  const pipeRegex = /\|/;
  const slashRegex = /\//;
  
  for (const line of lines) {
    const hasTab = tabRegex.test(line);
    const hasPipe = pipeRegex.test(line);
    const hasSlash = slashRegex.test(line);

    // If line contains tabs, split by tab
    if (hasTab) {
      rows.push(
        line.split("\t").reduce<string[]>((acc, s) => {
          const trimmed = s.trim();
          if (trimmed !== "") acc.push(trimmed);
          return acc;
        }, [])
      );
      continue;
    }

    // If line contains pipe-separated but not starting with | (some authors omit outer pipes)
    if (hasPipe) {
      const cells = line.split("|").reduce<string[]>((acc, s) => {
        const trimmed = s.trim();
        if (trimmed !== "") acc.push(trimmed);
        return acc;
      }, []);
      if (cells.length > 1) {
        rows.push(cells);
        continue;
      }
    }

    // If line contains slash separators like 'にち / ひ' or uses tabs and slashes, split on slash or multiple spaces
    if (hasSlash) {
      const parts = line.split("/").reduce<string[]>((acc, s) => {
        const trimmed = s.trim();
        if (trimmed !== "") acc.push(trimmed);
        return acc;
      }, []);
      // Also split the first segment by tab or spaces to separate word and pronunciation if needed
      if (parts.length >= 2) {
        // Try breaking first part by whitespace to get word and pronunciation when line like "夕\tゆう / せき\tBuổi chiều"
        const preParts = parts[0].split(/\s+/).reduce<string[]>((acc, s) => {
          const trimmed = s.trim();
          if (trimmed !== "") acc.push(trimmed);
          return acc;
        }, []);
        if (preParts.length > 1) {
          rows.push([
            preParts[0],
            preParts.slice(1).join(" "),
            ...parts.slice(1)
          ]);
        } else {
          rows.push(parts);
        }
        continue;
      }
    }

    // Fallback: split by two-or-more spaces or single tab or single space
    const byTwoSpaces = line.split(/\s{2,}/).reduce<string[]>((acc, s) => {
      const trimmed = s.trim();
      if (trimmed !== "") acc.push(trimmed);
      return acc;
    }, []);
    if (byTwoSpaces.length > 1) {
      rows.push(byTwoSpaces);
      continue;
    }

    const bySpace = line.split(/\s+/).reduce<string[]>((acc, s) => {
      const trimmed = s.trim();
      if (trimmed !== "") acc.push(trimmed);
      return acc;
    }, []);
    rows.push(bySpace);
  }

  return rows;
}
