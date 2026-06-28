# clone-vite — Agent Source of Truth

`AGENTS.md` is the authoritative project context for supported coding agents. The
canonical `/clone-website` workflow lives in `.claude/skills/clone-website/SKILL.md`.
`tooling/agent-targets.json` is the authoritative list of generated platform files.
Never edit a generated platform file directly.

---

## Project Purpose

`clone-vite` is an AI-agent launcher template. A developer points an agent at an
authorized public URL with the `/clone-website` skill command, and the agent:

1. Performs live DOM/CSS reconnaissance on the target.
2. Extracts design tokens (colors, fonts, spacing, radii) into `src/index.css`.
3. Downloads public assets into `public/`.
4. Writes per-component spec files into `docs/research/components/`.
5. Dispatches parallel builder sub-agents (one per component, each in its own git
   worktree branch).
6. Merges all worktrees, assembles the final page, and runs a visual-diff QA pass.

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Build | Vite 6 | `pnpm dev` / `pnpm build` / `pnpm preview` |
| Framework | React 19 + TypeScript 5.7 | Strict mode |
| Styling | Tailwind CSS v4 + OKLCH tokens | `@tailwindcss/vite` plugin |
| Components | shadcn/ui-compatible primitives | `@radix-ui/react-slot`, `cva`, `clsx`, `tailwind-merge` |
| Icons | Lucide React | Replace with extracted SVGs during clone phase |
| Package manager | pnpm | Lockfile must be committed when generated |
| Runtime | Node 22 | Defined by `.nvmrc` and `package.json` |

---

## Commands

```bash
pnpm install             # install dependencies and generate the lockfile when absent
pnpm dev                 # start dev server (http://localhost:5173)
pnpm build               # typecheck + Vite production build
pnpm preview             # serve dist/ locally
pnpm lint                # ESLint
pnpm typecheck           # TypeScript project check
pnpm check               # lint + typecheck + build
pnpm sync-rules          # render platform rule files from AGENTS.md
pnpm sync-skills         # render platform skill files from canonical SKILL.md
pnpm sync                # render every generated agent file
pnpm verify-generated    # fail when generated files drift from canonical sources
```

---

## Repository Layout

```
clone-vite/
├── AGENTS.md                         ← universal agent context source
├── repo-map.md                       ← high-signal structural map
├── changelog.md                      ← append-only edit log
├── tooling/
│   └── agent-targets.json            ← generated-file target manifest
├── index.html                        ← Vite entry HTML
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.tsx                      ← React entry point
│   ├── App.tsx                       ← root component (replaced during clone)
│   ├── index.css                     ← target design tokens and global styles
│   └── vite-env.d.ts
├── public/                           ← static assets populated during clone
├── docs/
│   └── research/
│       └── components/               ← per-component spec files
├── .claude/
│   └── skills/
│       └── clone-website/
│           └── SKILL.md              ← canonical clone skill source
└── scripts/
    ├── sync-agent-rules.sh           ← compatibility rule-sync entry point
    ├── sync-skills.mjs               ← manifest-driven renderer
    └── verify-generated.mjs          ← generated-file drift verifier
```

---

## Coding Standards

- **YAGNI + KISS + DRY** — build only what the current task needs, choose the
  simplest correct implementation, reuse existing helpers.
- TypeScript strict mode. No `any`. Explicit return types on exported functions.
- Tailwind utility classes for all styling. No inline `style=` props except for
  dynamic values unavailable in Tailwind.
- Component files: named exports, PascalCase filenames, co-located with their tests.
- No speculative abstractions. If a pattern appears fewer than 3 times, it is not
  yet worth extracting.

---

## Clone Phase Rules

1. **Recon first, build second.** Never write a component until its spec file exists
   in `docs/research/components/`.
2. **No personal aesthetic changes during emulation.** Match the target 1:1. Custom
   work happens only after the clone phase is complete and the user requests it.
3. **Parallel builders are isolated.** Each builder sub-agent receives one component
   spec and builds only that component.
4. **Merge orchestrator resolves conflicts.** The orchestrator owns final assembly
   and visual-diff QA.
5. **Asset fidelity.** Download target images, fonts, and icons before component work.

---

## Generated Agent Files

- Edit `AGENTS.md` for project rules.
- Edit `.claude/skills/clone-website/SKILL.md` for the clone workflow.
- Edit `tooling/agent-targets.json` to add, remove, or relocate a generated target.
- Run `pnpm sync` after any canonical-source or target-manifest change.
- Run `pnpm verify-generated` before committing generated agent-file changes.
- `CLAUDE.md`, `GEMINI.md`, and `.windsurfrules` remain explicit pointer files and
  are not rendered by the manifest.
