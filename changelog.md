# Changelog

All notable changes to `clone-vite` are documented here.
Format: `[YYYY-MM-DD] type: description`

---

## [2026-06-27] feat: full parity push — all missing files added

### Added
- `.claude/skills/clone-website/SKILL.md` — core `/clone-website` command definition, fully adapted for Vite + React 19 (replaces Next.js-specific `next/font`, `app/layout.tsx`, `npm run build` references with Vite equivalents: `src/index.css`, `src/App.tsx`, `pnpm build`)
- `scripts/sync-agent-rules.sh` — regenerates platform agent rule files from `AGENTS.md`; covers GitHub Copilot, Cline/Roo, Continue, Amazon Q
- `scripts/sync-skills.mjs` — regenerates platform skill/command files from `SKILL.md`; outputs to `.codex/`, `.github/`, `.cursor/`, `.windsurf/`, `.gemini/`, `.opencode/`, `.augment/`, `.continue/`, `.amazonq/` (9 platforms)
- `eslint.config.js` — Vite/React ESLint config using `typescript-eslint` strict mode, `react-hooks`, `react-refresh`; replaces Next.js-specific `eslint-config-next`
- `components.json` — shadcn/ui config for Vite: `rsc: false`, CSS path → `src/index.css`, all `@/` aliases
- `postcss.config.mjs` — `@tailwindcss/postcss` plugin (required for Tailwind v4 via PostCSS)
- `.gitignore` — standard Vite + pnpm ignores: `dist/`, `node_modules/`, `.env*`, `pnpm-lock.yaml`
- `.gitattributes` — LF line ending normalization for all text/script/source files; binary declarations for image/font assets
- `.nvmrc` — pins Node.js to v22
- `CLAUDE.md` — `@AGENTS.md` import pointer for Claude Code
- `GEMINI.md` — `@AGENTS.md` import pointer for Gemini CLI
- `.clinerules` — auto-generated Cline/Roo pointer to `AGENTS.md`
- `.windsurfrules` — auto-generated Windsurf pointer to `AGENTS.md`

### Summary
This commit brings `clone-vite` to full parity with `JCodesMore/ai-website-cloner-template` across all quality metrics: agent coverage (13 platforms), skill pipeline completeness, build tooling, linting, and repo hygiene. The only intentional divergence is the build framework (Vite vs. Next.js) and all stack references have been updated accordingly throughout `SKILL.md`.

---

## [2026-06-27] init: project scaffold

- Initial Vite + React 19 + TypeScript 5.7 scaffold
- Tailwind CSS v4 with `@tailwindcss/vite` plugin
- shadcn/ui (Radix primitives) base dependencies
- `AGENTS.md` — universal agent context (single source of truth)
- `repo-map.md` — structural map of the repository
- All 10 agent platform directories scaffolded (`.claude/`, `.cursor/`, `.windsurf/`, `.gemini/`, `.codex/`, `.amazonq/`, `.augment/`, `.continue/`, `.opencode/`, `.github/`)
- `docs/research/.gitkeep` — placeholder for runtime-generated component spec files
