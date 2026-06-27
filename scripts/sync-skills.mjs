#!/usr/bin/env node
// sync-skills.mjs
// Copies every .claude/skills/<name>/SKILL.md to all supported agent platforms.
// Run via: pnpm sync-skills

import { readFileSync, mkdirSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SKILLS_DIR = join(ROOT, '.claude', 'skills')

function destinations(skillName) {
  return [
    `.cursor/commands/${skillName}.md`,
    `.windsurf/workflows/${skillName}.md`,
    `.gemini/skills/${skillName}.md`,
    `.codex/skills/${skillName}.md`,
    `.amazonq/cli-agents/${skillName}.md`,
    `.augment/skills/${skillName}.md`,
    `.continue/skills/${skillName}.md`,
    `.opencode/skills/${skillName}.md`,
    `.github/skills/${skillName}/SKILL.md`,
  ]
}

function write(destRel, content) {
  const abs = join(ROOT, destRel)
  mkdirSync(dirname(abs), { recursive: true })
  writeFileSync(abs, content, 'utf8')
  console.log(`  wrote ${destRel}`)
}

console.log('Syncing skill files from .claude/skills/...')

const skills = readdirSync(SKILLS_DIR).filter(
  name => statSync(join(SKILLS_DIR, name)).isDirectory()
)

for (const skill of skills) {
  const src = join(SKILLS_DIR, skill, 'SKILL.md')
  let content
  try {
    content = readFileSync(src, 'utf8')
  } catch {
    console.warn(`  SKIP ${skill}: SKILL.md not found`)
    continue
  }
  console.log(`\nSkill: ${skill}`)
  for (const dest of destinations(skill)) {
    write(dest, content)
  }
}

console.log('\nDone.')
