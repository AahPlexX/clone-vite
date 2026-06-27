# clone-vite — Agent Source of Truth

Generated from AGENTS.md via `pnpm sync-rules`. Edit AGENTS.md, not this file.

## Project Purpose

AI-agent launcher template. Run `/clone-website <url>` to clone any public website
into a Vite + React + TypeScript codebase via a 5-phase pipeline:
Recon → Foundation → Component Specs → Parallel Build → Assembly & QA.

## Stack

Vite 6, React 19, TypeScript 5.7 strict, Tailwind CSS v4 (OKLCH tokens),
shadcn/ui (Radix), Lucide React, pnpm.

## Commands

```bash
pnpm install && pnpm dev
pnpm build
pnpm sync-rules
pnpm sync-skills
```

## Coding Standards

YAGNI + KISS + DRY. TypeScript strict, no `any`. Tailwind only. No inline styles.
No speculative abstractions.

## Clone Phase Rules

1. Recon first. Never build before spec exists.
2. No aesthetic changes. Match target 1:1.
3. Builders isolated — one component spec each.
4. Orchestrator owns merge + final QA.
5. All assets to `public/` before component work starts.
