#!/usr/bin/env node

/**
 * Fails when a generated platform rule or skill differs from the canonical
 * source rendered through tooling/agent-targets.json.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getTargets, renderTarget } from './sync-skills.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function normalize(content) {
  return content.replace(/\r\n/g, '\n');
}

function verifyTarget(kind, target) {
  const absolutePath = join(ROOT, target.path);

  if (!existsSync(absolutePath)) {
    return `${target.path}: missing`;
  }

  const actual = normalize(readFileSync(absolutePath, 'utf8'));
  const expected = renderTarget(kind, target);

  if (actual !== expected) {
    return `${target.path}: differs from canonical rendered output`;
  }

  return null;
}

function main() {
  const failures = ['rule', 'skill']
    .flatMap((kind) => getTargets(kind).map((target) => verifyTarget(kind, target)))
    .filter(Boolean);

  if (failures.length > 0) {
    console.error('Generated agent files are out of date:');
    failures.forEach((failure) => console.error(`  - ${failure}`));
    console.error('\nRun `pnpm sync-rules` and `pnpm sync-skills`, then commit the generated files.');
    process.exitCode = 1;
    return;
  }

  console.log('Generated agent files match their canonical sources.');
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
