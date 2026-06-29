# repo-map.md

> Verified against the repository during active work. Reality wins over this map.

## Commands

```bash
pnpm install
pnpm dev                 # http://localhost:5173
pnpm build               # tsc -b && vite build → dist/
pnpm preview
pnpm lint
pnpm typecheck
pnpm check               # lint + typecheck + build
pnpm sync                # regenerate all manifest-defined agent files
pnpm verify-generated    # fail on generated-file drift
pnpm validate-artifacts  # validate docs/research/**/run.json and listed component specs
```

## Entry Points

| File | Role |
|---|---|
| `index.html` | Vite HTML entry that loads `src/main.tsx` |
| `src/main.tsx` | React 19 root render |
| `src/App.tsx` | Starter command helper; replaced during clone assembly |
| `src/index.css` | Neutral global baseline and Tailwind semantic token mappings |

## Highest-Centrality Modules

| Path | Role |
|---|---|
| `AGENTS.md` | Canonical project rules for generated agent configurations and research evidence |
| `.claude/skills/clone-website/SKILL.md` | Canonical human-readable cloning workflow |
| `contracts/run.schema.json` | Required structure for one authorized target research run |
| `contracts/component-spec.schema.json` | Required structure for one builder component contract |
| `scripts/validate-artifacts.mjs` | Dependency-free cross-validator for run and component evidence |
| `tooling/agent-targets.json` | Canonical generated-file target and format manifest |
| `scripts/sync-skills.mjs` | Renderer for every manifest-defined rule and skill output |
| `scripts/verify-generated.mjs` | Confirms generated outputs match canonical sources |
| `src/lib/utils.ts` | Shared class-name composition utility used by UI primitives |
| `src/components/ui/button.tsx` | Native reusable Button baseline |
| `src/components/icons.tsx` | Local SVG export location for extracted icons |

## Present Categories

- **Build pipeline:** Vite 6, React 19, TypeScript project references, Tailwind v4.
- **Shared UI foundation:** semantic Tailwind tokens, `cn()`, native Button, local SVG exports.
- **Agent configuration:** canonical rule source, canonical clone skill, manifest-defined generated targets.
- **Research evidence:** per-target `run.json`, component JSON specs, companion Markdown briefs, and cross-validation.
- **Static assets:** `public/`, populated during a clone run.

## Active Hardening State

- Agent configuration is manifest-driven. After editing a canonical source or target
  manifest, run `pnpm sync` followed by `pnpm verify-generated`.
- Research evidence is validated per target with `pnpm validate-artifacts --
  docs/research/<hostname>` before builder dispatch.
- `pnpm-lock.yaml` is intentionally trackable; generate and commit it with the first
  dependency install performed in a networked development environment.
- Browser extraction, visual-diff automation, and worktree orchestration are not yet
  implemented as deterministic repository tooling.
