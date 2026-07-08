# Changelog

All notable changes to `clone-vite` are documented here.
Format: `[YYYY-MM-DD] type: description`

---

## [2026-07-08] feat(wave-1-completion): component-spec fixtures and shared TS content model

### Reconciliation note
Full live reconnaissance pass confirmed that all Wave 1 items 1–5 (product wording,
file ownership contract, path convention unification, schema hardening, run.json
fixtures) and items 8–9 (CI pipeline, starter scaffold foundation) were already
deployed to the repository before this session began. No edits to those files were
required. This entry records the remaining Wave 1 completion work: component-spec
fixtures (item 6 completion) and the shared TypeScript content model (P1 item 12
foundation).

### Added — component-spec fixtures (P0 item 6 completion)
- `contracts/fixtures/component-spec.valid.json` — a fully-passing component spec
  fixture that exercises every required field in `component-spec.schema.json` plus
  all optional fields (`stateCapture`, `responsiveBreakpoints`). The `states` array
  exercises two full state-diff entries (scrolled header, mobile drawer open) with
  `before`/`after`/`transition`/`implementation` shapes that will serve as the
  reference model for the style-diff helper. The `screenshotPaths` array uses the
  canonical `docs/research/example.com/screenshots/` prefix.
- `contracts/fixtures/component-spec.invalid.json` — an intentionally broken component
  spec fixture that violates six distinct schema rules, each documented inline as
  `_errors`:
  1. Missing required field `schemaVersion`
  2. `targetFile` outside `src/components/` (wrong prefix)
  3. `screenshotPaths[0]` uses the stale `docs/design-references/` prefix
  4. `interactionModel` value `hover-driven` is not in the allowed enum
  5. `computedStyles` is empty (violates `minProperties: 1`)
  6. `states[0]` missing required field `implementation`
  Each violation is a distinct validator code path, giving `validate-artifacts.mjs`
  a regression target for every component-spec error class.

### Added — shared TypeScript content model (P1 foundation)
- `src/types/index.ts` — single-file typed mirror of both JSON schemas. Exports:
  - Primitives: `InteractionModel`, `StateCapture`, `ViewportName`, `AssetKind`,
    `RunStatus`
  - `run.json` shapes: `Viewport`, `ScreenshotEntry`, `TopologyItem`, `AssetEntry`,
    `RunJson` (with tuple constraint `[Viewport, Viewport, Viewport, ...Viewport[]]`
    enforcing the schema's `minItems: 3` at the type level)
  - Component spec shapes: `StateTransition`, `ComponentAsset`, `ComponentSpecJson`
    (with `screenshotPaths: [string, ...string[]]` enforcing `minItems: 1`)
  All exported; no `any`; optional fields match schema's optional fields exactly.
  Scripts and app code must import from this file rather than re-declaring shapes.
  Any schema change requires a corresponding update here.

### Changed — repo-map.md
- Added `contracts/fixtures/component-spec.valid.json` and
  `contracts/fixtures/component-spec.invalid.json` to highest-centrality modules table.
- Added `src/types/index.ts` to highest-centrality modules table with role description.
- Added `src/types/index.ts` to Path Conventions table.
- Added "Shared TS content model" to Present Categories.
- Updated Active Hardening State to record Wave 1 completion and list remaining Wave 2 work.

---

## [2026-07-08] feat(wave-1): product wording, path contract, schema hardening, validator fixtures, CI

### Changed — product wording (P0 item 1)
- `README.md` — opening description updated to the authoritative product statement:
  "Reverse-engineer websites as Vite + React + TypeScript apps using an evidence-driven
  workflow and AI agents." Removed old phrasing that described the tool as a "portable
  evidence-driven system" without naming the output (Vite + React + TypeScript apps).
- `AGENTS.md` — added explicit `## Product Statement` block at the top with the same
  corrected wording. All generated agent files that sync from this source will
  inherit the corrected statement after the next `pnpm sync`.
- `repo-map.md` — added `## Product Statement` section with the corrected wording.

### Changed — file ownership contract (P0 item 2)
- `README.md` — added "Canonical vs. generated files" table classifying every file
  kind as canonical, generated, or runtime artifact. This makes the ownership split
  explicit before any new generated targets are added.
- `AGENTS.md` — added `## File Ownership Contract` table with the same three-tier
  classification.

### Changed — path contract unification (P0 items 3 & 4)
**Critical fix:** `contracts/run.schema.json` and `contracts/component-spec.schema.json`
both encoded the screenshot path prefix `docs/design-references/` which contradicted
the documented research directory `docs/research/<hostname>/`. This caused a schema
validation false-pass for any extractor writing to the documented path.
- `contracts/run.schema.json` — `screenshots[].path` regex updated from
  `^docs/design-references/` to `^docs/research/[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?/screenshots/`.
  This encodes the hostname segment in the validated path, making it deterministic.
- `contracts/component-spec.schema.json` — `screenshotPaths[]` items regex updated
  by the same fix.
- `repo-map.md` — added `## Path Conventions (deterministic)` table documenting the
  canonical root for every artifact type so scripts and agents have a single reference.
- `AGENTS.md` — added explicit "Screenshot path convention" note under the Research
  Evidence Contract section, stating `docs/research/<hostname>/screenshots/` is
  the only valid prefix.
- `README.md` — updated research evidence prose to state that all artifacts including
  screenshots live under `docs/research/<hostname>/`.

### Changed — schema hardening (P0 item 5)
- `contracts/run.schema.json` — added two optional fields to `topology[]` items:
  - `stateCapture` (enum: pending | complete | not-applicable): records whether a
    dedicated interaction/state sweep has been completed for this section beyond the
    structural baseline, closing the gap between baseline extraction and builder dispatch.
  - `interactionNotes` (string, minLength 1): free-text field for scroll thresholds,
    trigger mechanisms, and transition values captured during the state sweep.
- `contracts/component-spec.schema.json` — added two optional fields:
  - `stateCapture` (enum: pending | complete | not-applicable): mirrors the topology
    field at the component level so builders can confirm sweep completeness.
  - `responsiveBreakpoints` (array of integers): records pixel widths at which the
    component layout changes, closing the gap between the SKILL.md responsive sweep
    requirement and the schema contract.

### Added — validator fixtures (P0 item 6)
- `contracts/fixtures/run.valid.json` — a complete, passing `run.json` fixture with
  two topology sections (scroll-driven nav with stateCapture + interactionNotes,
  static hero), two screenshots at the now-correct path prefix, one asset, and two
  component spec references. Used to verify the validator accepts a correct artifact.
- `contracts/fixtures/run.invalid.json` — an intentionally broken `run.json` fixture
  that violates six distinct schema rules (missing schemaVersion, authorized:false,
  insufficient viewports, stale path prefix, unknown interactionModel, uppercase
  component slug). Each violation is documented inline as `_errors` so the fixture
  doubles as a regression guard for each error path in `validate-artifacts.mjs`.

### Added — CI pipeline (P0 item 8)
- `.github/workflows/ci.yml` — GitHub Actions workflow that runs on every push and
  pull request targeting `main`. Steps: checkout → Node 22 setup → pnpm setup with
  store caching → `pnpm install --frozen-lockfile` → `pnpm check` (lint + typecheck +
  build) → `pnpm verify-generated`. Cache key is keyed to `pnpm-lock.yaml` hash.
  CI was introduced after schema and fixture contracts are settled (per sequencing
  rule: do not lock CI on unstable expectations).

### Changed — repository map
- `repo-map.md` — added `contracts/fixtures/` entries to highest-centrality modules
  table; added Path Conventions table; updated Active Hardening State to reflect
  unified path contract, fixture addition, and CI pipeline.
- `AGENTS.md` — repository layout tree updated to include `contracts/fixtures/` and
  `.github/workflows/ci.yml`.
- `README.md` — project structure tree updated to include `contracts/fixtures/` and
  `.github/workflows/ci.yml`; Agent Configuration table updated to document fixtures.

---

## [2026-06-28] feat: establish minimal Vite UI foundation

### Added
- `src/lib/utils.ts` — added the `cn()` helper required by the existing `components.json` alias contract. It combines conditional classes and resolves conflicting Tailwind utilities.
- `src/components/ui/button.tsx` — added a native, typed Button primitive with the small variant and size surface needed by the starter application and future clone components.
- `src/components/icons.tsx` — added the local SVG export contract required by the clone workflow, with one starter icon used by the application.

### Changed
- `src/components/ui/button.tsx` — kept the newly added primitive native rather than polymorphic because no current clone component requires child-slot behavior; this avoids unnecessary baseline complexity.
- `src/index.css` — replaced the opinionated starter palette, automatic dark mode, smooth scrolling, type scale, and paragraph width defaults with a neutral reset plus Tailwind v4 semantic token mappings required by the Button and starter application.
- `src/App.tsx` — now uses the shared Button and local icon module. Added a functional clipboard helper for the displayed clone command and an accessible unavailable-clipboard message.
- `repo-map.md` — added the shared UI foundation and corrected entry-point roles.
- `changelog.md` — appended this chronological record of every existing-file edit in this response.

### Validation limits
- The repository integration was statically checked against the configured aliases and installed dependency declarations. No local package installation or build execution was available in this repository operation.

---

## [2026-06-28] fix: establish verifiable agent configuration baseline

### Added
- `tooling/agent-targets.json` — central manifest for every generated platform rule and clone-skill destination. This removes duplicated path definitions from scripts and documentation.
- `scripts/verify-generated.mjs` — compares every manifest-defined generated output with its current canonical rendering and exits non-zero on drift.

### Changed
- `scripts/sync-skills.mjs` — replaced hard-coded target paths with manifest-driven rendering for both agent rules and clone-skill adapters. It now exports the render functions consumed by the verifier and resolves direct script invocation paths before running.
- `scripts/sync-agent-rules.sh` — reduced to a compatibility entry point that delegates rule rendering to the manifest-driven Node renderer, eliminating duplicated rendering logic.
- `package.json` — added a Node 22 engine contract aligned with `.nvmrc`; added `typecheck`, `check`, `sync`, and `verify-generated` commands; made `sync-skills` explicitly render only skill targets.
- `.gitignore` — removed `pnpm-lock.yaml` so a generated dependency lockfile can be committed and used for reproducible installs.
- `AGENTS.md` — replaced contradictory generated-file claims with the canonical sources, manifest, renderer, verifier, and exact command workflow.
- `README.md` — replaced stale per-platform path claims with the manifest-based source-of-truth workflow and documented the actual commands.
- `repo-map.md` — corrected stale claims about rule-sync destinations and completion status; retained only verified, high-centrality facts.
- `changelog.md` — appended this chronological record of every existing-file edit in this response.

### Verified facts
- `.nvmrc` already pins Node 22, so no edit was required; `package.json` now matches that existing runtime contract.
- A `pnpm-lock.yaml` was not present and could not be generated in this repository operation because no executable checkout was available. The file is now trackable and must be generated by the next local or CI dependency installation.
- Generated platform files have not been regenerated in this repository operation. `pnpm sync` followed by `pnpm verify-generated` is the required reconciliation step before adding generated-file verification to the aggregate `pnpm check` gate.

---

## [2026-06-27] feat: full parity push — all missing files added

### Added
- `.claude/skills/clone-website/SKILL.md` — core `/clone-website` command definition, fully adapted for Vite + React 19 (replaces Next.js-specific `next/font`, `app/layout.tsx`, `npm run build` references with Vite equivalents: `src/index.css`, `src/App.tsx`, `pnpm build`)
- `scripts/sync-agent-rules.sh` — regenerates platform agent rule files from `AGENTS.md`; covers GitHub Copilot, Cline/Roo, Continue, Amazon Q
- `scripts/sync-skills.mjs` — regenerates platform skill/command files from `SKILL.md`; outputs to `.codex/`, `.github/`, `.cursor/`, `.windsurf/`, `.gemini/`, `.opencode/`, `.augment/`, `.continue/`, `.amazonq/` (9 platforms)
- `eslint.config.js` — Vite/React ESLint config using `typescript-eslint` strict mode, `react-hooks`, `react-refresh`; replaces Next.js-specific `eslint-config-next`
- `components.json` — shadcn/ui config for Vite: `rsc: false`, CSS path → `src/index.css`, all `@/` aliases
- `postcss.config.mjs` — `@tailwindcss/postcss` plugin (required for Tailwind v4 via PostCSS)
- `.gitignore` — standard Vite + pnpm ignores: `dist/`, `node_modules/`, `.env*`, `pnpm-lock.yaml`
- `.gitattributes` — LF line ending normalization for all text/script/source files; binary declarations for image/font assets
- `.nvmrc` — pins Node.js to v22
- `CLAUDE.md` — `@AGENTS.md` import pointer for Claude Code
- `GEMINI.md` — `@AGENTS.md` import pointer for Gemini CLI
- `.clinerules` — auto-generated Cline/Roo pointer to `AGENTS.md`
- `.windsurfrules` — auto-generated Windsurf pointer to `AGENTS.md`

### Summary
This commit brings `clone-vite` to full parity with `JCodesMore/ai-website-cloner-template` across all quality metrics: agent coverage (13 platforms), skill pipeline completeness, build tooling, linting, and repo hygiene. The only intentional divergence is the build framework (Vite vs. Next.js) and all stack references have been updated accordingly throughout `SKILL.md`.

---

## [2026-06-27] init: project scaffold

- Initial Vite + React 19 + TypeScript 5.7 scaffold
- Tailwind CSS v4 with `@tailwindcss/vite` plugin
- shadcn/ui (Radix primitives) base dependencies
- `AGENTS.md` — universal agent context (single source of truth)
- `repo-map.md` — structural map of the repository
- All 10 agent platform directories scaffolded (`.claude/`, `.cursor/`, `.windsurf/`, `.gemini/`, `.codex/`, `.amazonq/`, `.augment/`, `.continue/`, `.opencode/`, `.github/`)
- `docs/research/.gitkeep` — placeholder for runtime-generated component spec files

---

## [2026-06-28] feat: add validated research evidence contracts

### Added
- `contracts/run.schema.json` — defines the required target authorization, responsive viewports, screenshots, topology, asset inventory, and component-spec registry for one clone run.
- `contracts/component-spec.schema.json` — defines the required source section, target component file, evidence screenshots, exact styles, states, assets, text, and responsive behavior for one builder contract.
- `scripts/validate-artifacts.mjs` — dependency-free validator that checks both schemas and cross-validates component references against each run's topology, screenshots, and assets.

### Changed
- `package.json` — added `pnpm validate-artifacts` for validating research evidence without adding a schema dependency.
- `AGENTS.md` — requires dedicated per-target evidence directories and a passing artifact-validation command before builder dispatch; also lists the validator in the repository map.
- `README.md` — documents the run/component evidence files, validator command, and contract responsibilities.
- `repo-map.md` — records the research-contract modules and validation gate as high-centrality facts.
- `scripts/validate-artifacts.mjs` — hardened semantic-validation guards so malformed JSON produces validation errors instead of a runtime exception.
- `changelog.md` — appended this chronological record of every existing-file edit in this response.

### Compatibility decision
- `.claude/skills/clone-website/SKILL.md` remains unchanged. Its Markdown research briefs continue to provide narrative builder context; the JSON contracts supplement that workflow with machine-checkable evidence.

### Validation limits
- Schema and validator logic were source-reviewed for required fields, duplicate detection, reference integrity, and malformed-artifact guards. No executable checkout was available to run `pnpm validate-artifacts`, install dependencies, or build the project in this repository operation.
