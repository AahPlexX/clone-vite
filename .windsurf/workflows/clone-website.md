# Skill: clone-website

Invoked with: `/clone-website <target-url>`

Generated from .claude/skills/clone-website/SKILL.md via `pnpm sync-skills`.
Edit the source file, not this one.

## Phases

1. **Recon** — Screenshot, extract tokens.json, breakpoint screenshots, download assets.
2. **Foundation** — Rewrite src/index.css with extracted tokens. Wire fonts in index.html.
3. **Component Specs** — Write docs/research/components/<name>.md for every section.
4. **Parallel Build** — Git worktree per component, isolated builder sub-agent per worktree.
5. **Assembly & QA** — Compose src/App.tsx, pnpm build, visual diff at 375/768/1280px.

See .claude/skills/clone-website/SKILL.md for the full pipeline specification.
