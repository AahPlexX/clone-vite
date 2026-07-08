# clone-vite

`clone-vite` is a portable, evidence-driven system for **reverse-engineering websites
as Vite + React + TypeScript apps using an evidence-driven workflow and AI agents**.
It collects what the source site actually does, records that evidence, builds from it,
and verifies the result instead of depending on an agent's memory or guesses.

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
| 1. Recon | Capture screenshots, inspect DOM/CSS, record interactions, inventory assets |
| 2. Foundation | Apply observed tokens and fonts to the Vite application |
| 3. Evidence and specs | Write Markdown briefs plus validated JSON evidence per section |
| 4. Parallel build | Isolate component builders in worktrees after evidence validation |
| 5. Assembly and QA | Compose `src/App.tsx`, build, compare target and clone |

## Deterministic Baseline Capture

When Chrome is running with a **local** DevTools endpoint, capture the baseline before
writing component specifications:

```bash
pnpm extract-site -- --url=https://target.example --authorized
```

The extractor opens a disposable browser tab, captures desktop/tablet/mobile full-page
screenshots, records a structural topology and discovered public asset URLs, validates
the new run, and then closes its temporary tab. It refuses non-local DevTools endpoints
and requires the explicit `--authorized` confirmation. It is baseline collection only;
interaction and responsive behavior still require the later state sweep.

## Research Evidence

Each target gets an isolated research directory. All artifacts — including screenshots
— live under this single root:

```text
docs/research/<hostname>/
├── run.json
├── BEHAVIORS.md
├── PAGE_TOPOLOGY.md
└── components/
    ├── <component>.json
    └── <component>.spec.md
```

### Canonical vs. generated files

| Kind | Examples | Rule |
|---|---|---|
| **Canonical** | `AGENTS.md`, `.claude/skills/clone-website/SKILL.md`, `tooling/agent-targets.json`, `contracts/*.schema.json`, all scripts | Edit directly; never overwrite with sync |
| **Generated** | All files rendered by `pnpm sync` into agent platform directories | Never edit directly; change the canonical source then re-sync |
| **Runtime artifacts** | `docs/research/<hostname>/` trees, `public/` asset downloads | Created by extraction runs; not committed unless deliberately included |

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
| `contracts/fixtures/` | Valid and invalid example artifacts for validator testing |
| `scripts/extract-site.mjs` | Local Chrome DevTools baseline evidence capture |
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
pnpm extract-site        # capture an authorized target through local Chrome DevTools
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
│   ├── component-spec.schema.json
│   └── fixtures/
│       ├── run.valid.json
│       └── run.invalid.json
├── tooling/
│   └── agent-targets.json
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   └── button.tsx
│   │   └── icons.tsx
│   ├── index.css
│   ├── lib/
│   │   └── utils.ts
│   ├── main.tsx
│   └── vite-env.d.ts
├── public/
├── docs/research/
├── .claude/skills/clone-website/SKILL.md
├── .github/workflows/ci.yml
└── scripts/
    ├── extract-site.mjs
    ├── sync-agent-rules.sh
    ├── sync-skills.mjs
    ├── validate-artifacts.mjs
    └── verify-generated.mjs
```

## License

MIT
