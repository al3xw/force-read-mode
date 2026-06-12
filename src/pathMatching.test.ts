import * as micromatch from "micromatch";

// Mirrors the parsing logic in ForceReadModeSettingTab.display() onChange handler.
function parsePatterns(rawInput: string): string[] {
  return rawInput.split('\n').map((p: string) => p.trim()).filter((p: string) => p.length > 0);
}

// Mirrors the match check in onLayoutChange.
function isMatch(filePath: string, patterns: string[]): boolean {
  return patterns.some((pattern: string) => micromatch.isMatch(filePath, pattern));
}

describe('pattern parsing', () => {
  test('splits on newlines', () => {
    expect(parsePatterns('Notes/**\nProjects/**')).toEqual(['Notes/**', 'Projects/**']);
  });

  test('trims whitespace from each line', () => {
    expect(parsePatterns('  Notes/**  \n  Projects/**  ')).toEqual(['Notes/**', 'Projects/**']);
  });

  test('filters out blank lines', () => {
    expect(parsePatterns('Notes/**\n\n\nProjects/**')).toEqual(['Notes/**', 'Projects/**']);
  });

  test('returns empty array for empty input', () => {
    expect(parsePatterns('')).toEqual([]);
  });

  test('returns empty array for whitespace-only input', () => {
    expect(parsePatterns('   \n   \n')).toEqual([]);
  });
});

describe('path matching', () => {
  describe('basic glob patterns', () => {
    test('** matches files at any depth', () => {
      expect(isMatch('Notes/journal/today.md', ['Notes/**'])).toBe(true);
    });

    test('* matches files in a single folder only', () => {
      expect(isMatch('Notes/today.md', ['Notes/*'])).toBe(true);
      expect(isMatch('Notes/journal/today.md', ['Notes/*'])).toBe(false);
    });

    test('*.md matches only markdown files', () => {
      expect(isMatch('Notes/today.md', ['Notes/*.md'])).toBe(true);
      expect(isMatch('Notes/today.txt', ['Notes/*.md'])).toBe(false);
    });

    test('does not match a sibling folder', () => {
      expect(isMatch('Other/note.md', ['Notes/**'])).toBe(false);
    });

    test('multiple patterns: matches if any pattern matches', () => {
      const patterns = parsePatterns('Notes/**\nProjects/**');
      expect(isMatch('Notes/a.md', patterns)).toBe(true);
      expect(isMatch('Projects/b.md', patterns)).toBe(true);
      expect(isMatch('Archive/c.md', patterns)).toBe(false);
    });
  });

  describe('paths with spaces', () => {
    test('pattern with a space matches correctly', () => {
      expect(isMatch('My Notes/journal.md', ['My Notes/**'])).toBe(true);
    });

    test('pattern with a space does not match a different folder', () => {
      expect(isMatch('Other Notes/journal.md', ['My Notes/**'])).toBe(false);
    });

    test('multi-segment path with spaces', () => {
      expect(isMatch('Resources/Reading List/book.md', ['Resources/Reading List/**'])).toBe(true);
    });
  });

  describe('paths with parentheses', () => {
    // Parentheses are extglob syntax in micromatch, so literal parens in a
    // folder name require escaping or a wildcard workaround.

    test('unescaped parens in pattern do NOT match literally', () => {
      // (v2) is parsed as an extglob group rather than literal characters.
      expect(isMatch('Archive/Project (v2)/note.md', ['Archive/Project (v2)/**'])).toBe(false);
    });

    test('escaped parens match the literal folder name', () => {
      expect(isMatch('Archive/Project (v2)/note.md', ['Archive/Project \\(v2\\)/**'])).toBe(true);
    });

    test('wildcard workaround matches folder with parens', () => {
      expect(isMatch('Archive/Project (v2)/note.md', ['Archive/Project*/**'])).toBe(true);
    });

    test('bracket syntax workaround matches literal parens', () => {
      expect(isMatch('Archive/Project (v2)/note.md', ['Archive/Project [(]v2[)]/**'])).toBe(true);
    });
  });

  describe('edge cases', () => {
    test('no patterns means nothing matches', () => {
      expect(isMatch('Notes/today.md', [])).toBe(false);
    });

    test('** pattern matches files at vault root', () => {
      expect(isMatch('readme.md', ['**'])).toBe(true);
    });
  });
});
