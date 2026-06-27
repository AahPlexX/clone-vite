# clone-vite

An AI-agent launcher template for cloning any public website into a production-grade
Vite + React + TypeScript codebase. Point an agent at a URL, run one command, and
receive a pixel-faithful clone with extracted design tokens, downloaded assets, and
fully typed React components.

## Quick Start

```bash
# 1. Use this template (click "Use this template" on GitHub)
# 2. Clone your copy and install
git clone https://github.com/<you>/clone-vite
cd clone-vite
pnpm install

# 3. Start Claude Code with browser access
claude --chrome

# 4. Run the clone command
/clone-website https://target-site.com
```

The agent handles everything from there.

## How It Works

The `/clone-website` command triggers a 5-phase pipeline defined in
`.claude/skills/clone-website/SKILL.md`:

| Phase | What happens |
|---|---|
| 1. Recon | Screenshot, extract CSS tokens, record interactions, download all assets |
| 2. Foundation | Rewrite `src/index.css` with OKLCH tokens, wire fonts in `index.html` |
| 3. Component Specs | Write a detailed spec file per section into `docs/research/components/` |
| 4. Parallel Build | Git worktree + isolated builder sub-agent per component |
| 5. Assembly & QA | Compose `src/App.tsx`, `pnpm build`, visual diff at 375/768/1280px |

## Stack

| Layer | Choice |
|---|---|
| Build | Vite 6 |
| Framework | React 19 + TypeScript 5.7 (strict) |
| Styling | Tailwind CSS v4 + OKLCH design tokens |
| Components | shadcn/ui (Radix primitives) |
| Icons | Lucide React |
| Package manager | pnpm |

## Supported Agents

All platform files are generated from `AGENTS.md` — never edit them directly.

| Platform | Rule file | Skill file |
|---|---|---|
| Claude Code | `AGENTS.md` | `.claude/skills/clone-website/SKILL.md` |
| Cursor | `.cursor/rules/clone-vite.mdc` | `.cursor/commands/clone-website.md` |
| Windsurf | `.windsurf/rules/clone-vite.md` | `.windsurf/workflows/clone-website.md` |
| Gemini CLI | `.gemini/GEMINI.md` | `.gemini/skills/clone-website.md` |
| Codex | `.codex/instructions.md` | `.codex/skills/clone-website.md` |
| Amazon Q | `.amazonq/dev/instructions.md` | `.amazonq/cli-agents/clone-website.md` |
| Augment | `.augment/instructions.md` | `.augment/skills/clone-website.md` |
| Continue | `.continue/config/clone-vite.md` | `.continue/skills/clone-website.md` |
| OpenCode | `.opencode/context.md` | `.opencode/skills/clone-website.md` |
| GitHub Copilot | `.github/copilot-instructions.md` | `.github/skills/clone-website/SKILL.md` |

## Keeping Platform Files in Sync

```bash
# After editing AGENTS.md:
pnpm sync-rules

# After editing .claude/skills/clone-website/SKILL.md:
pnpm sync-skills
```

## Commands

```bash
pnpm dev          # http://localhost:5173
pnpm build        # tsc -b && vite build
pnpm preview      # serve dist/ locally
pnpm lint
pnpm sync-rules
pnpm sync-skills
```

## Project Structure

```
clone-vite/
├── AGENTS.md                        # universal agent source-of-truth
├── src/
│   ├── App.tsx                      # root component (replaced during clone)
│   ├── index.css                    # Tailwind v4 + OKLCH tokens (rewritten during clone)
│   ├── main.tsx                     # React 19 entry
│   └── vite-env.d.ts
├── public/                          # static assets (populated during clone)
├── docs/research/                   # recon output (populated during clone)
├── .claude/skills/clone-website/    # skill source of truth
└── scripts/
    ├── sync-agent-rules.sh
    └── sync-skills.mjs
```

## License

MIT
