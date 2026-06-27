# Changelog

Append-only. Every existing-file edit and every new file addition is logged here.

---

## 2026-06-26

### Added `package.json`
- Establishes the project as a Vite 6 + React 19 + TypeScript 5.7 app with pnpm.
- Declares all runtime deps (`react`, `react-dom`, Radix slot, `cva`, `clsx`,
  `lucide-react`, `tailwind-merge`, `tailwindcss-animate`) and dev deps
  (`vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `typescript`, `eslint` stack).
- Defines `dev`, `build`, `preview`, `lint` scripts.

### Added `vite.config.ts`
- Registers `@vitejs/plugin-react` and `@tailwindcss/vite` plugins.
- Configures `@` path alias → `./src` so all internal imports use `@/` prefix.

### Added `AGENTS.md`
- Universal agent source-of-truth document consumed by all AI coding agent
  platforms (Claude Code, Cursor, Windsurf, Gemini CLI, Amazon Q, Codex, etc.).
- Documents project purpose, stack, commands, repo layout, coding standards,
  clone-phase rules, and platform file sync instructions.
- Platform-specific files (`.cursor/rules/`, `.windsurf/rules/`, etc.) are
  generated FROM this file via `pnpm sync-rules`; never edited directly.

### Added `repo-map.md`
- High-signal structural map: commands, entry points, highest-centrality modules,
  conditional categories present, and the phase plan.
- Hard-capped at ~200 lines. Staleness rule: reality wins; correct here and log.

### Added `changelog.md`
- This file. Append-only chronological edit log required by response protocol.
