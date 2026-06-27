# clone-vite — Agent Source of Truth

This file is the single authoritative context document for ALL AI coding agents
(Claude Code, Cursor, Windsurf, Copilot, Gemini CLI, Amazon Q, Codex, Continue,
OpenCode, Augment). Platform-specific rule files are auto-generated FROM this file
by running `pnpm sync-rules`. Never edit the platform files directly.

---

## Project Purpose

`clone-vite` is an AI-agent launcher template. A developer points an agent at any
public URL with the `/clone-website` skill command, and the agent:

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
| Components | shadcn/ui (Radix primitives) | `@radix-ui/react-slot`, `cva`, `clsx`, `tailwind-merge` |
| Icons | Lucide React | Replace with extracted SVGs during clone phase |
| Package manager | pnpm | Never npm or yarn |

---

## Commands

```bash
pnpm install        # install deps
pnpm dev            # start dev server (http://localhost:5173)
pnpm build          # tsc + vite build → dist/
pnpm preview        # serve dist/ locally
pnpm lint           # eslint
pnpm sync-rules     # regenerate platform rule files from AGENTS.md
pnpm sync-skills    # regenerate platform skill files from .claude/skills/
```

---

## Repository Layout

```
clone-vite/
├── AGENTS.md                         ← THIS FILE — universal agent context
├── repo-map.md                       ← high-signal structural map (auto-maintained)
├── changelog.md                      ← append-only edit log
├── index.html                        ← Vite entry HTML
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── src/
│   ├── main.tsx                      ← React entry point
│   ├── App.tsx                       ← Root component (replaced during clone)
│   ├── index.css                     ← Tailwind + OKLCH design tokens
│   └── vite-env.d.ts
├── public/                           ← Static assets (populated during clone)
├── docs/
│   └── research/
│       └── components/               ← Per-component spec files (written by agent)
├── .claude/
│   └── skills/
│       └── clone-website/
│           └── SKILL.md              ← /clone-website command definition
└── scripts/
    ├── sync-agent-rules.sh           ← Generates platform rule files from AGENTS.md
    └── sync-skills.mjs               ← Generates platform skill files from .claude/skills/
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

## Clone Phase Rules (agent must follow during `/clone-website`)

1. **Recon first, build second.** Never write a component until its spec file exists
   in `docs/research/components/`.
2. **No personal aesthetic changes during emulation.** Match the target 1:1. Custom
   work happens only after the clone phase is complete and the user requests it.
3. **Parallel builders are isolated.** Each builder sub-agent receives ONE component
   spec and builds only that component. No cross-component reasoning.
4. **Merge orchestrator resolves conflicts.** The orchestrator (not the builders)
   owns the final assembly and visual-diff QA.
5. **Asset fidelity.** All images, fonts, and icons from the target are downloaded
   to `public/` before any component is built.

---

## Platform File Sync

Do NOT edit these files directly — they are generated:

```
.cursor/rules/clone-vite.mdc
.windsurf/rules/clone-vite.md
.gemini/GEMINI.md
.codex/instructions.md
.amazonq/dev/instructions.md
.augment/instructions.md
.continue/config/clone-vite.md
.opencode/context.md
.github/copilot-instructions.md
```

Run `pnpm sync-rules` to regenerate all of them after editing `AGENTS.md`.
