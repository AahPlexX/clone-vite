# repo-map.md

> Verified against the repository during active work. Reality wins over this map.

## Product Statement

Reverse-engineer websites as Vite + React + TypeScript apps using an evidence-driven
workflow and AI agents.

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
| `AGENTS.md` | Canonical project rules and file-ownership contract |
| `.claude/skills/clone-website/SKILL.md` | Canonical human-readable cloning workflow |
| `contracts/run.schema.json` | Required structure for one authorized target research run |
| `contracts/component-spec.schema.json` | Required structure for one builder component contract |
| `contracts/fixtures/run.valid.json` | Passing run.json fixture for validator testing |
| `contracts/fixtures/run.invalid.json` | Failing run.json fixture for validator error-path testing |
| `contracts/fixtures/component-spec.valid.json` | Passing component-spec fixture for validator testing |
| `contracts/fixtures/component-spec.invalid.json` | Failing component-spec fixture for validator error-path testing |
| `src/types/index.ts` | Shared TS content model — mirrors both JSON schemas; import here in scripts and components |
| `scripts/validate-artifacts.mjs` | Dependency-free cross-validator for run and component evidence |
| `tooling/agent-targets.json` | Canonical generated-file target and format manifest |
| `scripts/sync-skills.mjs` | Renderer for every manifest-defined rule and skill output |
| `scripts/verify-generated.mjs` | Confirms generated outputs match canonical sources |
| `src/lib/utils.ts` | Shared class-name composition utility used by UI primitives |
| `src/components/ui/button.tsx` | Native reusable Button baseline |
| `src/components/icons.tsx` | Local SVG export location for extracted icons |

## Path Conventions (deterministic)

| Artifact | Root path |
|---|---|
| Screenshots (all viewports) | `docs/research/<hostname>/screenshots/` |
| Run evidence | `docs/research/<hostname>/run.json` |
| Component specs (JSON + Markdown) | `docs/research/<hostname>/components/` |
| Downloaded assets | `public/` |
| Canonical schemas | `contracts/` |
| Validator fixtures | `contracts/fixtures/` |
| Shared TypeScript types | `src/types/index.ts` |

## Present Categories

- **Build pipeline:** Vite 6, React 19, TypeScript project references, Tailwind v4.
- **Shared UI foundation:** semantic Tailwind tokens, `cn()`, native Button, local SVG exports.
- **Shared TS content model:** `src/types/index.ts` — typed mirrors of both JSON schemas.
- **Agent configuration:** canonical rule source, canonical clone skill, manifest-defined generated targets.
- **Research evidence:** per-target `run.json`, component JSON specs, companion Markdown briefs, and cross-validation.
- **Validator fixtures:** passing and failing examples for both `run.json` and component specs.
- **Static assets:** `public/`, populated during a clone run.
- **CI:** `.github/workflows/ci.yml` — install + check + verify-generated on push/PR to main.

## Active Hardening State

- Agent configuration is manifest-driven. After editing a canonical source or target
  manifest, run `pnpm sync` followed by `pnpm verify-generated`.
- Research evidence is validated per target with `pnpm validate-artifacts --
  docs/research/<hostname>` before builder dispatch.
- Screenshot path convention is unified: all paths use
  `docs/research/<hostname>/screenshots/` in both schemas and SKILL.md.
- `contracts/fixtures/` provides valid and invalid examples for both `run.json` and
  component specs, covering all required fields and the six primary error paths each.
- `src/types/index.ts` is the single typed source of truth mirroring both schemas.
  Scripts and components must import from here; never re-declare these shapes locally.
- CI pipeline enforces install + check + verify-generated on every push and PR.
- `pnpm-lock.yaml` is intentionally trackable; generate and commit it with the first
  dependency install performed in a networked development environment.
- Wave 2 remaining: `scripts/download-assets.mjs`, `scripts/sweep-states.mjs`,
  `src/hooks/useCloneRun.ts`, style-diff helper, SVG extraction, component-spec generator.
- Browser extraction, visual-diff automation, and worktree orchestration are not yet
  implemented as deterministic repository tooling.
