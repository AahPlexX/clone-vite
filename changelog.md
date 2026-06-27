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
- Platform-specific files are generated FROM this file via `pnpm sync-rules`.

### Added `repo-map.md`
- High-signal structural map: commands, entry points, highest-centrality modules,
  conditional categories present, and the phase plan.

### Added `changelog.md`
- This file. Append-only chronological edit log.

### Added `tsconfig.json`
- Project-level TypeScript config using composite references pattern.
- References `tsconfig.app.json` (src/) and `tsconfig.node.json` (vite.config.ts).

### Added `tsconfig.app.json`
- App source TypeScript config: ES2020 target, strict mode, `noEmit`, `react-jsx`,
  `bundler` module resolution, `@/*` path alias matching `vite.config.ts`.

### Added `tsconfig.node.json`
- Node/config TypeScript config: ES2022 target, strict mode, covers `vite.config.ts`.

### Added `index.html`
- Vite HTML entry point. Mounts `#root` div and loads `src/main.tsx` as ES module.

### Added `src/main.tsx`
- React 19 root render. Creates root from `#root` element, wraps `<App>` in
  `<StrictMode>`. Throws a clear error if `#root` is missing.

### Added `src/App.tsx`
- Minimal placeholder root component. Renders a centered launch instruction so
  `pnpm dev` boots a real UI immediately. Replaced wholesale by the clone agent.

### Added `src/index.css`
- Tailwind v4 `@import` directive + full OKLCH design token layer in `@layer base`.
- Defines `--background`, `--surface`, `--foreground`, `--primary`, `--muted`,
  `--accent`, `--destructive`, `--radius`, spacing scale, and fluid type scale.
- Light mode in `:root`, dark mode in `[data-theme="dark"]` and
  `@media (prefers-color-scheme: dark) :root:not([data-theme])`.
- Includes base reset (box-sizing, smoothing, scroll-behavior, reduced-motion).
- This file is rewritten by the clone agent recon phase to match the target site.

### Added `src/vite-env.d.ts`
- Single-line Vite client type reference. Required for `import.meta.env`,
  `import.meta.hot`, and static asset imports to resolve under TypeScript strict mode.

### Edited `repo-map.md`
- Ticked phase 3 complete in the phase plan (src/ files now fully present).
