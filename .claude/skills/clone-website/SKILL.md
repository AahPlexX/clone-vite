# Skill: clone-website

Invoked with: `/clone-website <target-url>`

You are the orchestrator agent for a full website clone pipeline. Follow every
phase in order. Do not skip phases. Do not build components before their spec
files exist. Do not introduce personal aesthetic changes — match the target 1:1.

---

## Phase 1 — Reconnaissance

**Goal:** Collect every design and layout fact needed before writing a single
component. Output goes to `docs/research/`.

1. Open `<target-url>` in a browser with JavaScript enabled.
2. Capture a full-page screenshot → save as `docs/research/screenshot-full.png`.
3. Capture viewport screenshot (1280px) → `docs/research/screenshot-viewport.png`.
4. Run this recon script in the browser console and save the JSON output to
   `docs/research/tokens.json`:

```js
(() => {
  const computed = getComputedStyle(document.documentElement);
  const props = [...document.styleSheets]
    .flatMap(s => { try { return [...s.cssRules] } catch { return [] } })
    .filter(r => r.selectorText === ':root')
    .flatMap(r => [...r.style])
    .filter(p => p.startsWith('--'));
  const tokens = Object.fromEntries(props.map(p => [p, computed.getPropertyValue(p).trim()]));
  const fonts = [...new Set(
    [...document.querySelectorAll('*')]
      .map(el => getComputedStyle(el).fontFamily)
  )];
  return JSON.stringify({ tokens, fonts }, null, 2);
})()
```

5. Record all breakpoints by resizing to 375px, 768px, 1024px, 1280px, 1440px —
   capture a screenshot at each → `docs/research/bp-{width}.png`.
6. Interact with every visible interactive element (hover, focus, click, scroll).
   Document state changes in `docs/research/interactions.md`.
7. Download ALL public assets:
   - Images → `public/assets/images/`
   - Fonts → `public/assets/fonts/`
   - Icons/SVGs → `public/assets/icons/`
   - Favicon → `public/favicon.*`

**Phase 1 is complete when:** `tokens.json`, both screenshots, all breakpoint
screenshots, `interactions.md`, and all public assets exist.

---

## Phase 2 — Foundation

**Goal:** Wire the extracted design system into the project before any component
work starts.

1. Rewrite `src/index.css` — translate every token from `tokens.json` into
   CSS custom properties under `@layer base`. Use OKLCH for all color values.
   Preserve the existing file structure (`:root` light, `[data-theme="dark"]` dark,
   `@media prefers-color-scheme` fallback, base reset).
2. Update font imports in `index.html` — add `<link>` preconnect + stylesheet
   tags for every font family found in `tokens.json`.
3. Verify `pnpm dev` still boots with no console errors before proceeding.

**Phase 2 is complete when:** `src/index.css` reflects the target's tokens,
fonts are loading, and `pnpm dev` is error-free.

---

## Phase 3 — Component Specs

**Goal:** Write a detailed spec file for every discrete section/component on
the page BEFORE building any of them.

For each component:
1. Create `docs/research/components/<component-name>.md`.
2. Each spec must contain:
   - **Visual description** — layout, element hierarchy, exact spacing values
   - **Typography** — font-family, size (px), weight, line-height, color token
   - **Colors** — background, border, text — reference extracted token names
   - **Responsive behavior** — how it changes at each breakpoint
   - **States** — default, hover, focus, active, disabled (with exact values)
   - **Content** — ALL text strings, image paths, icon names exactly as they appear
   - **Interactions** — animations, transitions (duration, easing, property)
   - **Accessibility** — ARIA roles, labels, keyboard behavior

3. List every component in `docs/research/component-registry.md` with its
   spec file path and build status (`pending` | `in-progress` | `done`).

**Phase 3 is complete when:** every section of the target page has a spec file
and all entries in `component-registry.md` show `pending`.

---

## Phase 4 — Parallel Build (Git Worktrees)

**Goal:** Build all components in parallel, each in an isolated git worktree.

1. For each component in `component-registry.md`:
   a. Create a worktree branch:
      `git worktree add ../clone-vite-<name> -b build/<name>`
   b. Dispatch a builder sub-agent with this exact instruction:

```
You are a builder sub-agent. Your ONLY job is to implement the component
described in docs/research/components/<component-name>.md.

Rules:
- Read the spec file completely before writing a single line.
- Create src/components/<ComponentName>.tsx with a named export.
- Use only Tailwind utility classes and CSS variables already defined in
  src/index.css. No new CSS files. No inline style= props for static values.
- Match the spec pixel-perfectly. No interpretation, no improvements.
- The component must render correctly at all breakpoints in the spec.
- When done, update docs/research/component-registry.md: set your entry to `done`.
- Do not touch any other file.
```

2. Update `component-registry.md` entry to `in-progress` when a builder starts.
3. When ALL builders complete, merge all worktrees into main:
   ```bash
   for branch in $(git branch | grep 'build/'); do
     git merge --no-ff "$branch" -m "merge: $branch"
   done
   ```
4. Remove all worktrees: `git worktree prune`

**Phase 4 is complete when:** all entries in `component-registry.md` show `done`
and all worktree branches are merged and pruned.

---

## Phase 5 — Assembly & QA

**Goal:** Wire all components into the page and verify fidelity against the original.

1. Rewrite `src/App.tsx` — import and compose every component from
   `src/components/` in the correct DOM order per the original page structure.
2. Run `pnpm build` — fix all TypeScript and lint errors before proceeding.
3. Run `pnpm preview` and open at 1280px viewport.
4. Take a full-page screenshot → `docs/research/screenshot-clone-full.png`.
5. Perform a visual diff against `docs/research/screenshot-full.png`:
   - Flag any section where layout, spacing, color, or typography deviates visibly.
   - For each flagged section, identify which component spec it maps to and
     correct the component until the diff passes.
6. Repeat the screenshot + diff cycle at 375px and 768px.
7. Verify keyboard navigation (Tab through all interactive elements).
8. Verify `pnpm build` exits 0 with no warnings.

**Phase 5 is complete when:** visual diff passes at all three viewports,
`pnpm build` exits 0, and keyboard navigation works.

---

## Completion Checklist

- [ ] `docs/research/tokens.json` exists
- [ ] `docs/research/screenshot-full.png` exists
- [ ] All breakpoint screenshots exist
- [ ] All public assets downloaded to `public/`
- [ ] `src/index.css` reflects target tokens
- [ ] Fonts loading in `index.html`
- [ ] Every component has a spec in `docs/research/components/`
- [ ] `docs/research/component-registry.md` all entries `done`
- [ ] `src/App.tsx` assembles all components
- [ ] `pnpm build` exits 0
- [ ] Visual diff passes at 375px, 768px, 1280px
- [ ] Keyboard navigation verified
