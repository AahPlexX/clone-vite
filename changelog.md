# Changelog

Append-only. Every existing-file edit and every new file addition is logged here.

---

## 2026-06-26

### Added `package.json`
- Vite 6 + React 19 + TypeScript 5.7 manifest. Runtime + dev deps. `dev`, `build`, `preview`, `lint` scripts.

### Added `vite.config.ts`
- `@vitejs/plugin-react` + `@tailwindcss/vite`. `@` alias → `./src`.

### Added `AGENTS.md`
- Universal agent source-of-truth. All platform files generated from this.

### Added `repo-map.md`
- High-signal structural map: commands, entry points, centrality, phase plan.

### Added `changelog.md`
- This file.

### Added `tsconfig.json`
- Composite root referencing `tsconfig.app.json` + `tsconfig.node.json`.

### Added `tsconfig.app.json`
- App TS config: strict, `react-jsx`, bundler resolution, `@/*` alias.

### Added `tsconfig.node.json`
- Node/vite-config TS config: strict, ES2022.

### Added `index.html`
- Vite HTML entry. Mounts `#root`, loads `src/main.tsx`.

### Added `src/main.tsx`
- React 19 root render with `StrictMode` and null-guard.

### Added `src/App.tsx`
- Placeholder root component. Replaced by clone agent Phase 5.

### Added `src/index.css`
- Tailwind v4 + OKLCH design tokens. Light/dark modes. Base reset.

### Added `src/vite-env.d.ts`
- Vite client type reference.

### Added `.claude/skills/clone-website/SKILL.md`
- 5-phase `/clone-website` pipeline: Recon → Foundation → Specs → Parallel Build → QA.

### Added `scripts/sync-agent-rules.sh`
- Copies `AGENTS.md` to 9 platform rule destinations. `pnpm sync-rules`.

### Added `scripts/sync-skills.mjs`
- Copies each skill SKILL.md to 9 platform skill destinations. `pnpm sync-skills`.

### Edited `package.json`
- Added `sync-rules` and `sync-skills` scripts.

---

## 2026-06-27

### Added platform rule files (9 — generated from AGENTS.md)
- `.cursor/rules/clone-vite.mdc`
- `.windsurf/rules/clone-vite.md`
- `.gemini/GEMINI.md`
- `.codex/instructions.md`
- `.amazonq/dev/instructions.md`
- `.augment/instructions.md`
- `.continue/config/clone-vite.md`
- `.opencode/context.md`
- `.github/copilot-instructions.md`

### Added platform skill files (9 — generated from .claude/skills/clone-website/SKILL.md)
- `.cursor/commands/clone-website.md`
- `.windsurf/workflows/clone-website.md`
- `.gemini/skills/clone-website.md`
- `.codex/skills/clone-website.md`
- `.amazonq/cli-agents/clone-website.md`
- `.augment/skills/clone-website.md`
- `.continue/skills/clone-website.md`
- `.opencode/skills/clone-website.md`
- `.github/skills/clone-website/SKILL.md`

### Added `docs/research/.gitkeep`
- Scaffolds the runtime research directory so it exists before the clone agent writes into it.

### Added `README.md`
- Quick start, pipeline table, stack, supported agents table, sync workflow, commands, project structure.

### Edited `repo-map.md`
- Phase 6 ticked complete. STATUS: COMPLETE.
