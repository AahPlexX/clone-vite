# clone-vite

An AI-agent template for rebuilding authorized public websites into a Vite + React
+ TypeScript codebase. It keeps agent instructions, command adapters, and research
evidence tied to canonical sources so they cannot silently drift.

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
| 3. Evidence and specs | Write Markdown briefs plus validated JSON evidence per section |
| 4. Parallel build | Isolate component builders in worktrees after evidence validation |
| 5. Assembly and QA | Compose `src/App.tsx`, build, compare target and clone |

## Research Evidence

Each target gets an isolated research directory:

```text
docs/research/<hostname>/
├── run.json
├── BEHAVIORS.md
├── PAGE_TOPOLOGY.md
└── components/
    ├── <component>.json
    └── <component>.spec.md
```

`run.json` captures authorized-target metadata, viewports, screenshots, page
topology, discovered assets, and component-spec paths. Each component JSON captures
its source section, target file, exact styles, states, assets, text, and responsive
behavior. The companion Markdown files remain the detailed builder brief.

Validate the evidence before dispatching builders:

```bash
pnpm validate-artifacts -- docs/research/<hostname>
```

## Stack

| Layer | Choice |
|---|---|
| Build | Vite 6 |
| Framework | React 19 + TypeScript 5.7 |
| Styling | Tailwind CSS v4 + target-specific tokens |
| Components | Native React elements plus small reusable primitives |
| Icons | Local SVG exports, replaced with extracted target SVGs when needed |
| Package manager | pnpm |
| Runtime | Node 22 |

## Agent Configuration

| Canonical source | Responsibility |
|---|---|
| `AGENTS.md` | Project rules shared by generated agent configurations |
| `.claude/skills/clone-website/SKILL.md` | Canonical website-cloning workflow |
| `tooling/agent-targets.json` | Every generated target path and renderer format |
| `contracts/*.schema.json` | Machine-checkable research evidence contracts |
| `scripts/sync-skills.mjs` | Manifest-driven generator for rules and skills |
| `scripts/verify-generated.mjs` | Drift detector for generated outputs |
| `scripts/validate-artifacts.mjs` | Research run and component-spec validator |

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
pnpm validate-artifacts  # validate research artifacts under docs/research/
```

## Project Structure

```text
clone-vite/
├── AGENTS.md
├── repo-map.md
├── changelog.md
├── contracts/
│   ├── run.schema.json
│   └── component-spec.schema.json
├── tooling/
│   └── agent-targets.json
├── src/
│   ├── App.tsx
│   ├── components/
│   ├── index.css
│   ├── lib/
│   ├── main.tsx
│   └── vite-env.d.ts
├── public/
├── docs/research/
├── .claude/skills/clone-website/SKILL.md
└── scripts/
    ├── sync-agent-rules.sh
    ├── sync-skills.mjs
    ├── validate-artifacts.mjs
    └── verify-generated.mjs
```

## License

MIT
