#!/usr/bin/env node

/**
 * Renders platform-specific agent rules and clone-website command files from
 * their canonical sources and tooling/agent-targets.json.
 *
 * Usage:
 *   node scripts/sync-skills.mjs --kind=rule
 *   node scripts/sync-skills.mjs --kind=skill
 *   node scripts/sync-skills.mjs --kind=all
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST_PATH = join(ROOT, 'tooling', 'agent-targets.json');
const SKILL_DESCRIPTION = 'Reverse-engineer and clone any website as a pixel-perfect Vite + React replica';

function normalize(content) {
  return content.replace(/\r\n/g, '\n');
}

function readProjectFile(relativePath) {
  const absolutePath = join(ROOT, relativePath);

  if (!existsSync(absolutePath)) {
    throw new Error(`Required source file is missing: ${relativePath}`);
  }

  return normalize(readFileSync(absolutePath, 'utf8'));
}

function loadManifest() {
  const manifest = JSON.parse(readProjectFile('tooling/agent-targets.json'));

  if (!Array.isArray(manifest.rules) || !Array.isArray(manifest.skills)) {
    throw new Error('tooling/agent-targets.json must contain rules and skills arrays.');
  }

  return manifest;
}

function resolveAgentImports(content) {
  return content
    .split('\n')
    .map((line) => {
      const match = line.match(/^@(.+)$/);

      if (!match) {
        return line;
      }

      return readProjectFile(match[1]);
    })
    .join('\n');
}

function generatedHeader(sourceCommand) {
  return `<!-- AUTO-GENERATED — do not edit directly.\n     Run \`${sourceCommand}\` to regenerate. -->\n\n`;
}

function readSkill() {
  const manifest = loadManifest();
  const raw = readProjectFile(manifest.skillSource);
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!match) {
    throw new Error(`${manifest.skillSource} must begin with YAML frontmatter.`);
  }

  return { raw, body: match[2], source: manifest.skillSource };
}

function renderRule(target) {
  const manifest = loadManifest();
  const content = resolveAgentImports(readProjectFile(manifest.ruleSource));
  const header = generatedHeader('pnpm sync-rules');

  switch (target.format) {
    case 'cursor-rule':
      return `---\ndescription: clone-vite project instructions\nalwaysApply: true\n---\n\n${header}${content}`;
    case 'continue-rule':
      return `---\ndescription: clone-vite project instructions\nalwaysApply: true\n---\n\n${header}${content}`;
    case 'markdown':
      return `${header}${content}`;
    default:
      throw new Error(`Unsupported rule format: ${target.format}`);
  }
}

function renderSkill(target) {
  const { raw, body } = readSkill();
  const header = generatedHeader('pnpm sync-skills');
  const commandBody = body.replace(/\$ARGUMENTS/g, 'the target URL provided by the user');

  switch (target.format) {
    case 'raw-skill':
      return raw;
    case 'plain-command':
      return `${header}${commandBody}`;
    case 'command-frontmatter':
      return `---\ndescription: "${SKILL_DESCRIPTION}"\n---\n\n${header}${body}`;
    case 'augment-command':
      return `---\ndescription: "${SKILL_DESCRIPTION}"\nargument-hint: "<url>"\n---\n\n${header}${body}`;
    case 'continue-command':
      return `---\nname: clone-website\ndescription: "${SKILL_DESCRIPTION}"\ninvokable: true\n---\n\n${header}${body}`;
    default:
      throw new Error(`Unsupported skill format: ${target.format}`);
  }
}

export function getTargets(kind) {
  const manifest = loadManifest();

  if (kind === 'rule') {
    return manifest.rules;
  }

  if (kind === 'skill') {
    return manifest.skills.filter((target) => target.format !== 'source');
  }

  throw new Error(`Unsupported target kind: ${kind}`);
}

export function renderTarget(kind, target) {
  if (kind === 'rule') {
    return renderRule(target);
  }

  if (kind === 'skill') {
    return renderSkill(target);
  }

  throw new Error(`Unsupported target kind: ${kind}`);
}

function writeTarget(target, content) {
  const absolutePath = join(ROOT, target.path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, content, 'utf8');
  console.log(`  ✓ ${target.path}`);
}

function parseKind() {
  const argument = process.argv.find((value) => value.startsWith('--kind='));
  const kind = argument?.slice('--kind='.length) ?? 'all';

  if (!['all', 'rule', 'skill'].includes(kind)) {
    throw new Error('Use --kind=rule, --kind=skill, or --kind=all.');
  }

  return kind;
}

function main() {
  const kind = parseKind();
  const kinds = kind === 'all' ? ['rule', 'skill'] : [kind];

  for (const currentKind of kinds) {
    console.log(`Syncing ${currentKind} files from canonical sources...`);

    for (const target of getTargets(currentKind)) {
      writeTarget(target, renderTarget(currentKind, target));
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
