# repo-map.md

> Maintained by AI agent. Reality wins over this file. Correct here + log in changelog.md when they diverge.

## Commands

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # tsc -b && vite build → dist/
pnpm preview
pnpm lint
pnpm sync-rules   # regenerate platform rule files from AGENTS.md
pnpm sync-skills  # regenerate platform skill files from .claude/skills/
```

## Entry Points

| File | Role |
|---|---|
| `index.html` | Vite HTML entry — loads `src/main.tsx` |
| `src/main.tsx` | React 19 root render |
| `src/App.tsx` | Root component; replaced wholesale during clone phase |
| `src/index.css` | Tailwind v4 + OKLCH design tokens; rewritten by clone recon phase |

## Highest-Centrality Modules

| Path | Role |
|---|---|
| `AGENTS.md` | Universal agent source-of-truth; all platform files generated from it |
| `.claude/skills/clone-website/SKILL.md` | `/clone-website` slash-command definition |
| `scripts/sync-agent-rules.sh` | Generates platform rule files from `AGENTS.md` |
| `scripts/sync-skills.mjs` | Generates platform skill files from `.claude/skills/` |

## Conditional Categories Present

- **Build pipeline:** Vite 6, `@tailwindcss/vite`, `@vitejs/plugin-react`
- **Component primitives:** shadcn/ui via `@radix-ui/react-slot` + `cva`
- **Agent skill commands:** `.claude/skills/clone-website/SKILL.md`
- **Platform sync scripts:** `scripts/sync-agent-rules.sh`, `scripts/sync-skills.mjs`
- **Research scaffold:** `docs/research/components/` (populated by clone agent at runtime)

## Phase Plan

1. ✅ `package.json`, `vite.config.ts`, `AGENTS.md` — foundation wired
2. ⬜ `tsconfig.json`, `index.html`, `src/main.tsx`
3. ⬜ `src/App.tsx`, `src/index.css`, `src/vite-env.d.ts`
4. ⬜ `.claude/skills/clone-website/SKILL.md`
5. ⬜ `scripts/sync-agent-rules.sh`, `scripts/sync-skills.mjs`
6. ⬜ Platform sync outputs + `docs/research/` scaffold + `README.md`
