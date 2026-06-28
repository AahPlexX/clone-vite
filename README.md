# clone-vite

An AI-agent template for rebuilding authorized public websites into a Vite + React
+ TypeScript codebase. It keeps agent instructions and command adapters generated
from canonical sources so tool-specific copies cannot silently drift.

## Quick Start

```bash
# 1. Create your copy and install dependencies
pnpm install

# 2. Render and verify the agent adapters in your copy
pnpm sync
pnpm verify-generated

# 3. Start an agent with authorized browser access, then run
/clone-website https://target-site.com
```

Use this only where you have permission to inspect, reuse, and reproduce the
target's content and assets.

## How It Works

The canonical `/clone-website` workflow is defined in
`.claude/skills/clone-website/SKILL.md`:

| Phase | What happens |
|---|---|
| 1. Recon | Screenshot, extract CSS tokens, record interactions, download assets |
| 2. Foundation | Apply observed tokens and fonts to the Vite application |
| 3. Component specs | Write an evidence-based specification for each section |
| 4. Parallel build | Isolate component builders in worktrees |
| 5. Assembly and QA | Compose `src/App.tsx`, build, compare target and clone |

## Stack

| Layer | Choice |
|---|---|
| Build | Vite 6 |
| Framework | React 19 + TypeScript 5.7 |
| Styling | Tailwind CSS v4 + target-specific tokens |
| Components | shadcn/ui-compatible primitives |
| Icons | Lucide React, replaced by extracted SVGs when needed |
| Package manager | pnpm |
| Runtime | Node 22 |

## Agent Configuration

| Canonical source | Responsibility |
|---|---|
| `AGENTS.md` | Project rules shared by generated agent configurations |
| `.claude/skills/clone-website/SKILL.md` | Canonical website-cloning workflow |
| `tooling/agent-targets.json` | Every generated target path and renderer format |
| `scripts/sync-skills.mjs` | Manifest-driven generator for rules and skills |
| `scripts/verify-generated.mjs` | Drift detector for generated outputs |

Do not edit generated platform files directly. Update a canonical source, then run
`pnpm sync` and `pnpm verify-generated`.

## Commands

```bash
pnpm dev                 # http://localhost:5173
pnpm build               # typecheck + Vite production build
pnpm preview             # serve dist/ locally
pnpm lint                # ESLint
pnpm typecheck           # TypeScript project check
pnpm check               # lint + typecheck + build
pnpm sync-rules          # render rule files from AGENTS.md
pnpm sync-skills         # render command/skill files from canonical SKILL.md
pnpm sync                # render every generated agent file
pnpm verify-generated    # fail when generated files drift
```

## Project Structure

```text
clone-vite/
├── AGENTS.md
├── repo-map.md
├── changelog.md
├── tooling/
│   └── agent-targets.json
├── src/
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── public/
├── docs/research/
├── .claude/skills/clone-website/SKILL.md
└── scripts/
    ├── sync-agent-rules.sh
    ├── sync-skills.mjs
    └── verify-generated.mjs
```

## License

MIT
