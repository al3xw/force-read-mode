# Force Read Mode

**Force Read Mode** is a simple Obsidian plugin that ensures all Markdown files within specified paths are always opened in read (preview) mode. It’s useful when you want to prevent accidental edits or enforce a read-only experience for certain files.

## Features
- Automatically forces read mode when opening Markdown files from specified folders.
- Supports multiple folder patterns.
- Uses powerful micromatch glob syntax.
- Simple and lightweight.
- Quickly enable or disable via the Command Palette.
- No impact on files outside the configured folders.

## How It Works

- When a Markdown file is opened, the plugin checks its path.
- If the path matches a configured pattern, the file opens in read mode.
- This happens every time the file is opened.
- You can temporarily disable this behavior using a command.

## How to Use

1. Go to **Settings → Community Plugins → Browse** and install the **Force Read Mode** plugin.
2. Enable the plugin from **Settings → Community Plugins**.
3. Open **Settings → Force Read Mode** to configure:
   - Add a pattern for files you want to open in read mode (one pattern per line).
   - Patterns use micromatch syntax.
   - Examples:
      - `Notes/**` — all files under the `Notes` folder (any depth).
      - `Projects/*/*.md` — Markdown files directly inside a subfolder of `Projects`.
      - `**/Readme.md` — all `Readme.md` files.
4. Use the Command Palette (`Ctrl+P` or `Cmd+P`) to toggle the plugin on or off with **Force Read Mode: Enable** or **Force Read Mode: Disable**.

---

## Development

To contribute to or modify this plugin:

1. Clone the repository.
2. Install dependencies using `npm install`.
3. Build the plugin with `npm run build`.
4. Load the plugin into Obsidian for testing.
5. Open a pull request with your changes.
