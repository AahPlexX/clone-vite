#!/usr/bin/env node

/**
 * Generates clone-website command/skill files for all supported AI coding platforms.
 * Source of truth: .claude/skills/clone-website/SKILL.md
 *
 * Usage: node scripts/sync-skills.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(ROOT, '.claude', 'skills', 'clone-website', 'SKILL.md');

let raw;
try {
  raw = readFileSync(SOURCE, 'utf8').replace(/\r\n/g, '\n');
} catch {
  console.error(`Error: Source skill not found at .claude/skills/clone-website/SKILL.md`);
  process.exit(1);
}

const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
if (!match) {
  console.error('Error: Could not parse SKILL.md frontmatter');
  process.exit(1);
}

const body = match[2];
const shortDesc = 'Reverse-engineer and clone any website as a pixel-perfect Vite + React replica';

function write(relPath, content) {
  const full = join(ROOT, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content, 'utf8');
  console.log(`  \u2713 ${relPath}`);
}

const HEADER =
  '<!-- AUTO-GENERATED from .claude/skills/clone-website/SKILL.md \u2014 do not edit directly.\n' +
  '     Run `node scripts/sync-skills.mjs` to regenerate. -->\n\n';

const noArgs = (text) => text.replace(/\$ARGUMENTS/g, 'the target URL provided by the user');

console.log('Syncing clone-website skill to all platforms...');
console.log(`  Source: .claude/skills/clone-website/SKILL.md\n`);

// Codex CLI
write('.codex/skills/clone-website/SKILL.md', raw);

// GitHub Copilot
write('.github/skills/clone-website/SKILL.md', raw);

// Cursor
write('.cursor/commands/clone-website.md', HEADER + noArgs(body));

// Windsurf
write('.windsurf/workflows/clone-website.md', HEADER + noArgs(body));

// Gemini CLI
const geminiBody = body.replace(/\$ARGUMENTS/g, '{{args}}');
write(
  '.gemini/commands/clone-website.toml',
  `# AUTO-GENERATED from .claude/skills/clone-website/SKILL.md\n` +
    `# Run \`node scripts/sync-skills.mjs\` to regenerate.\n\n` +
    `description = "${shortDesc}"\nname = "clone-website"\n\nprompt = '''\n${geminiBody}\n'''\n`
);

// OpenCode
write(
  '.opencode/commands/clone-website.md',
  `---\ndescription: "${shortDesc}"\n---\n${HEADER}${body}`
);

// Augment Code
write(
  '.augment/commands/clone-website.md',
  `---\ndescription: "${shortDesc}"\nargument-hint: "<url>"\n---\n${HEADER}${body}`
);

// Continue
write(
  '.continue/commands/clone-website.md',
  `---\nname: clone-website\ndescription: "${shortDesc}"\ninvokable: true\n---\n${HEADER}${body}`
);

// Amazon Q
write(
  '.amazonq/cli-agents/clone-website.json',
  JSON.stringify(
    {
      name: 'clone-website',
      description: shortDesc,
      prompt: noArgs(body),
      fileContext: ['AGENTS.md', 'docs/research/**'],
    },
    null,
    2
  ) + '\n'
);

console.log('\nDone! 9 platform command files generated from source skill.');
