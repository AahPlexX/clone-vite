# clone-vite — Agent Source of Truth

`AGENTS.md` is the authoritative project context for supported coding agents.

**Product statement:** `clone-vite` reverse-engineers websites as Vite + React +
TypeScript apps using an evidence-driven workflow and AI agents.

The canonical `/clone-website` workflow lives in `.claude/skills/clone-website/SKILL.md`.
`tooling/agent-targets.json` is the authoritative list of generated platform files.
Never edit a generated platform file directly.

---

## Project Purpose

`clone-vite` is an AI-agent launcher template. A developer points an agent at an
authorized public URL with the `/clone-website` skill command, and the agent:

1. Performs live DOM/CSS reconnaissance on the target.
2. Extracts design tokens (colors, fonts, spacing, radii) into `src/index.css`.
3. Downloads public assets into `public/`.
4. Writes human-readable Markdown research plus validated JSON run and component
   evidence under `docs/research/<hostname>/`.
5. Dispatches parallel builder sub-agents only after their component evidence passes
   `pnpm validate-artifacts`.
6. Merges all worktrees, assembles the final page, and runs a visual-diff QA pass.

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Build | Vite 6 | `pnpm dev` / `pnpm build` / `pnpm preview` |
| Framework | React 19 + TypeScript 5.7 | Strict mode |
| Styling | Tailwind CSS v4 + OKLCH tokens | `@tailwindcss/vite` plugin |
| Components | shadcn/ui-compatible primitives | `cva`, `clsx`, `tailwind-merge` |
| Icons | Local SVG exports | Replace the starter icon with extracted SVGs during clone phase |
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
pnpm extract-site -- --url=https://target.example --authorized
                          # capture baseline evidence through local Chrome DevTools
pnpm validate-artifacts -- docs/research/<hostname>
                          # validate one target's run.json and component JSON specs
```

---

## File Ownership Contract

| Kind | Examples | Rule |
|---|---|---|
| **Canonical** | `AGENTS.md`, `.claude/skills/clone-website/SKILL.md`, `tooling/agent-targets.json`, `contracts/*.schema.json`, all `scripts/` | Edit directly; never overwrite with sync |
| **Generated** | All files rendered by `pnpm sync` into agent platform directories | Never edit directly; change the canonical source then re-sync |
| **Runtime artifacts** | `docs/research/<hostname>/` trees, `public/` asset downloads | Created by extraction runs; not committed unless deliberately included |

---

## Research Evidence Contract

For every authorized target, create a dedicated directory:

```text
docs/research/<hostname>/
├── run.json                 # machine-validated target, viewports, topology, assets
├── BEHAVIORS.md             # human-readable interaction notes
├── PAGE_TOPOLOGY.md         # human-readable assembly plan
└── components/
    ├── <component>.json     # machine-validated builder contract
    └── <component>.spec.md  # detailed human-readable builder brief
```

**Screenshot path convention:** All screenshots are saved under
`docs/research/<hostname>/screenshots/` and referenced by that path in both
`run.json` and component JSON specs. No screenshots are written to
`docs/design-references/`.

- `scripts/extract-site.mjs` opens a disposable tab through a **local** Chrome
  DevTools endpoint, captures full-page desktop/tablet/mobile screenshots, discovers
  initial topology and public asset URLs, writes the baseline evidence, validates it,
  then closes its temporary tab.
- Start Chrome with remote debugging enabled on the local endpoint before running the
  extractor. It refuses non-local DevTools endpoints and requires `--authorized`.
- `contracts/run.schema.json` defines `run.json`.
- `contracts/component-spec.schema.json` defines each component JSON specification.
- `contracts/fixtures/` contains valid and invalid example artifacts for testing the
  validator without a real extraction run.
- `run.json` must identify an authorized target, all desktop/tablet/mobile viewports,
  screenshots, section topology, known assets, and every component JSON path.
- Component JSON must identify its source section, target React file, screenshots,
  exact computed styles, captured states, local assets, verbatim text, and responsive
  behavior.
- Markdown artifacts remain required for nuanced builder context. JSON exists to block
  missing, orphaned, duplicate, or untraceable evidence before implementation.
- The extractor's interaction classifications are only structural. Complete the
  scroll, click, hover, timed, and responsive state sweep before builder dispatch.
- Run `pnpm validate-artifacts -- docs/research/<hostname>` before dispatching a
  builder and after changing the run or any listed component JSON file.

---

## Repository Layout

```text
clone-vite/
├── AGENTS.md                         ← canonical agent context source
├── repo-map.md                       ← high-signal structural map
├── changelog.md                      ← append-only edit log
├── contracts/
│   ├── run.schema.json               ← clone research run contract
│   ├── component-spec.schema.json    ← component builder contract
│   └── fixtures/
│       ├── run.valid.json            ← passing run.json fixture
│       └── run.invalid.json          ← failing run.json fixture
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
├── docs/research/                    ← per-target evidence directories
├── .claude/skills/clone-website/SKILL.md
├── .github/workflows/ci.yml          ← CI: install + check + verify-generated
└── scripts/
    ├── extract-site.mjs              ← Chrome DevTools baseline extractor
    ├── sync-agent-rules.sh           ← compatibility rule-sync entry point
    ├── sync-skills.mjs               ← manifest-driven renderer
    ├── validate-artifacts.mjs        ← research evidence cross-validator
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

1. **Capture the baseline first.** Use `pnpm extract-site -- --url=<target> --authorized`
   when a local Chrome DevTools endpoint is available. It complements, but does not
   replace, the canonical browser interaction sweep.
2. **Recon first, build second.** Never write a component until its Markdown brief
   and JSON component contract exist under the target research directory.
3. **Validate evidence before dispatch.** A builder may not start until
   `pnpm validate-artifacts -- docs/research/<hostname>` passes.
4. **No personal aesthetic changes during emulation.** Match the target 1:1. Custom
   work happens only after the clone phase is complete and the user requests it.
5. **Parallel builders are isolated.** Each builder sub-agent receives one component
   spec and builds only that component.
6. **Merge orchestrator resolves conflicts.** The orchestrator owns final assembly
   and visual-diff QA.
7. **Asset fidelity.** Download target images, fonts, and icons before component work.
8. **Merge safety.** After merging any builder worktree, run `pnpm exec tsc --noEmit`
   and `pnpm build` before merging the next. A broken build must be fixed immediately
   and never left compounding across merges.

---

## Generated Agent Files

- Edit `AGENTS.md` for project rules.
- Edit `.claude/skills/clone-website/SKILL.md` for the clone workflow.
- Edit `tooling/agent-targets.json` to add, remove, or relocate a generated target.
- Run `pnpm sync` after any canonical-source or target-manifest change.
- Run `pnpm verify-generated` before committing generated agent-file changes.
- `CLAUDE.md`, `GEMINI.md`, and `.windsurfrules` remain explicit pointer files and
  are not rendered by the manifest.
