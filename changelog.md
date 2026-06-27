# Changelog

Append-only. Every existing-file edit and every new file addition is logged here.

---

## 2026-06-26

### Added `package.json`
- Vite 6 + React 19 + TypeScript 5.7 app manifest with pnpm.
- Runtime + dev deps declared. `dev`, `build`, `preview`, `lint` scripts.

### Added `vite.config.ts`
- `@vitejs/plugin-react` + `@tailwindcss/vite` plugins. `@` alias → `./src`.

### Added `AGENTS.md`
- Universal agent source-of-truth. All platform files generated from this.

### Added `repo-map.md`
- High-signal structural map: commands, entry points, centrality, phase plan.

### Added `changelog.md`
- This file.

### Added `tsconfig.json`
- Composite project root referencing `tsconfig.app.json` + `tsconfig.node.json`.

### Added `tsconfig.app.json`
- App source TS config: strict, `react-jsx`, bundler resolution, `@/*` alias.

### Added `tsconfig.node.json`
- Node/vite-config TS config: strict, ES2022.

### Added `index.html`
- Vite HTML entry. Mounts `#root`, loads `src/main.tsx`.

### Added `src/main.tsx`
- React 19 root render with `StrictMode` and null-guard on `#root`.

### Added `src/App.tsx`
- Minimal placeholder root component. Replaced by clone agent during Phase 5.

### Added `src/index.css`
- Tailwind v4 `@import` + OKLCH design token layer. Light/dark modes. Base reset.
- Rewritten by clone agent recon phase to match the target site's tokens.

### Added `src/vite-env.d.ts`
- Vite client type reference for `import.meta` and asset imports.

### Added `.claude/skills/clone-website/SKILL.md`
- Defines the `/clone-website <url>` slash command for Claude Code.
- Five-phase pipeline: Recon → Foundation → Component Specs → Parallel Build
  (git worktrees) → Assembly & QA. Includes browser recon script, builder
  sub-agent instruction template, and completion checklist.
- This is the functional core of the template; all other platforms receive
  a copy via `pnpm sync-skills`.

### Added `scripts/sync-agent-rules.sh`
- Copies `AGENTS.md` to all 9 platform rule destinations.
- Invoked by `pnpm sync-rules`. Creates destination dirs as needed.

### Added `scripts/sync-skills.mjs`
- ESM Node script that discovers every `.claude/skills/<name>/SKILL.md` and
  copies it to all 9 platform skill destinations per skill.
- Invoked by `pnpm sync-skills`. Warns and skips on missing SKILL.md.

### Edited `package.json`
- Added `sync-rules`: `bash scripts/sync-agent-rules.sh`.
- Added `sync-skills`: `node scripts/sync-skills.mjs`.

### Edited `repo-map.md`
- Ticked phases 4 and 5 complete in the phase plan.
