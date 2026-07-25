import { parsePatterns, matchesAnyPattern } from './pathMatching';

function isMatch(filePath: string, patterns: string[]): boolean {
  return matchesAnyPattern(filePath, patterns);
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
    // Parentheses are always literal here — no escaping or workarounds needed.

    test('parens in pattern match the literal folder name', () => {
      expect(isMatch('Archive/Project (v2)/note.md', ['Archive/Project (v2)/**'])).toBe(true);
    });

    test('parens do not match a differently-named folder', () => {
      expect(isMatch('Archive/Project (v3)/note.md', ['Archive/Project (v2)/**'])).toBe(false);
    });

    test('wildcard also matches a folder with parens', () => {
      expect(isMatch('Archive/Project (v2)/note.md', ['Archive/Project*/**'])).toBe(true);
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
