# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Force Read Mode is an Obsidian plugin (single-plugin repo, not a library). It forces Markdown files whose vault path matches a configured glob pattern to always open in read/preview mode. Patterns are matched with `micromatch`.

## Commands

- `npm run dev` — esbuild in watch mode, builds `main.ts` → `main.js` with inline sourcemaps.
- `npm run build` — type-checks (`tsc -noEmit -skipLibCheck`) then produces a minified production `main.js` via esbuild.
- `npm test` — runs the Jest suite (`src/pathMatching.test.ts`) via `ts-jest`.
- `npm test -- -t "<test name>"` — run a single test by name.
- `npm run version` — bumps `manifest.json`/`versions.json` to the version in `package.json` and stages both files (used for releases, not regular dev).

There is no separate lint script; ESLint config exists (`.eslintrc`) but isn't wired into `npm` scripts — run `npx eslint main.ts src` directly if needed.

## Architecture

- `main.ts` is the entire plugin: it defines `ForceReadModePlugin` (lifecycle, settings, the layout-change handler) and `ForceReadModeSettingTab` (the settings UI) in one file. There is no `src/` plugin code — `src/` currently holds only the test suite.
- Core logic lives in `onLayoutChange`, hooked to Obsidian's `layout-change` workspace event: for every open Markdown leaf, it checks the file's vault-relative path against each configured glob pattern (`micromatch.isMatch`) and, on a match, forces `leaf.setViewState(...)` to `mode: 'preview'`. This re-runs on *every* layout change, so it's the mechanism that keeps re-forcing read mode if a user tries to switch back to edit mode.
- Settings (`ForceReadModePluginSettings.targetFolderPaths: string[]`) are persisted via Obsidian's `loadData`/`saveData`, merged over `DEFAULT_SETTINGS`. The settings tab stores patterns as one-per-line text; parsing/trimming logic there is intentionally mirrored (not imported, since it's UI-embedded) by `parsePatterns` in `src/pathMatching.test.ts` — if you change the parsing behavior in `ForceReadModeSettingTab.display()`'s `onChange`, update the test's mirrored copy too.
- The toggle command (`toggle-force-read-mode`) flips `isEnabled` and re-registers itself via `toggleCommand()` so the command palette label switches between "Enable"/"Disable".
- `src/pathMatching.test.ts` tests micromatch semantics directly (glob depth, spaces in paths, parentheses/extglob escaping) rather than importing from `main.ts` — treat it as the source of truth for expected pattern-matching edge cases (e.g. literal parens need escaping or a bracket-syntax workaround).
- Build output (`main.js`) is bundled by esbuild with `obsidian`, `electron`, CodeMirror/Lezer packages, and Node builtins marked external — never hand-edit `main.js`, it's generated.
