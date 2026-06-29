#!/usr/bin/env node

/**
 * Validates clone research run artifacts without an external schema dependency.
 *
 * Usage:
 *   node scripts/validate-artifacts.mjs [docs/research/<hostname>]
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)))
const DEFAULT_RESEARCH_DIRECTORY = join(ROOT, 'docs', 'research')
const RUN_SCHEMA_PATH = join(ROOT, 'contracts', 'run.schema.json')

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`${relative(ROOT, filePath)}: invalid JSON (${message})`)
  }
}

function validateFormat(value, format, location, errors) {
  if (format === 'uri') {
    try {
      new URL(value)
    } catch {
      errors.push(`${location}: must be an absolute URI`)
    }
  }

  if (format === 'date-time') {
    const hasTimezone = /T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)

    if (!hasTimezone || Number.isNaN(Date.parse(value))) {
      errors.push(`${location}: must be an RFC 3339 date-time with a timezone`)
    }
  }
}

function validateValue(value, schema, location, errors) {
  if ('const' in schema && value !== schema.const) {
    errors.push(`${location}: must equal ${JSON.stringify(schema.const)}`)
    return
  }

  if (Array.isArray(schema.enum) && !schema.enum.includes(value)) {
    errors.push(`${location}: must be one of ${schema.enum.map((item) => JSON.stringify(item)).join(', ')}`)
    return
  }

  if (schema.type === 'object') {
    if (!isPlainObject(value)) {
      errors.push(`${location}: must be an object`)
      return
    }

    const properties = schema.properties ?? {}
    const required = schema.required ?? []

    for (const key of required) {
      if (!(key in value)) {
        errors.push(`${location}.${key}: is required`)
      }
    }

    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!(key in properties)) {
          errors.push(`${location}.${key}: is not allowed`)
        }
      }
    }

    for (const [key, propertySchema] of Object.entries(properties)) {
      if (key in value) {
        validateValue(value[key], propertySchema, `${location}.${key}`, errors)
      }
    }

    if (isPlainObject(schema.additionalProperties)) {
      for (const [key, nestedValue] of Object.entries(value)) {
        if (!(key in properties)) {
          validateValue(nestedValue, schema.additionalProperties, `${location}.${key}`, errors)
        }
      }
    }

    return
  }

  if (schema.type === 'array') {
    if (!Array.isArray(value)) {
      errors.push(`${location}: must be an array`)
      return
    }

    if (typeof schema.minItems === 'number' && value.length < schema.minItems) {
      errors.push(`${location}: must contain at least ${schema.minItems} item(s)`)
    }

    if (schema.items) {
      value.forEach((item, index) => validateValue(item, schema.items, `${location}[${index}]`, errors))
    }

    return
  }

  if (schema.type === 'string') {
    if (typeof value !== 'string') {
      errors.push(`${location}: must be a string`)
      return
    }

    if (typeof schema.minLength === 'number' && value.length < schema.minLength) {
      errors.push(`${location}: must contain at least ${schema.minLength} character(s)`)
    }

    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      errors.push(`${location}: does not match ${schema.pattern}`)
    }

    if (schema.format) {
      validateFormat(value, schema.format, location, errors)
    }

    return
  }

  if (schema.type === 'integer') {
    if (!Number.isInteger(value)) {
      errors.push(`${location}: must be an integer`)
      return
    }

    if (typeof schema.minimum === 'number' && value < schema.minimum) {
      errors.push(`${location}: must be at least ${schema.minimum}`)
    }

    return
  }

  if (schema.type === 'boolean' && typeof value !== 'boolean') {
    errors.push(`${location}: must be a boolean`)
  }
}

function validateRunSemantics(run, location, errors) {
  const requiredViewports = new Set(['desktop', 'tablet', 'mobile'])
  const viewportNames = run.viewports.map((viewport) => viewport.name)
  const uniqueViewportNames = new Set(viewportNames)

  if (uniqueViewportNames.size !== viewportNames.length) {
    errors.push(`${location}.viewports: viewport names must be unique`)
  }

  for (const viewportName of requiredViewports) {
    if (!uniqueViewportNames.has(viewportName)) {
      errors.push(`${location}.viewports: missing ${viewportName} viewport`)
    }
  }

  const screenshotPaths = new Set()
  for (const screenshot of run.screenshots) {
    if (!uniqueViewportNames.has(screenshot.viewport)) {
      errors.push(`${location}.screenshots: references unknown viewport ${screenshot.viewport}`)
    }

    if (screenshotPaths.has(screenshot.path)) {
      errors.push(`${location}.screenshots: duplicate path ${screenshot.path}`)
    }

    screenshotPaths.add(screenshot.path)
  }

  const topologyIds = new Set()
  const topologyOrders = new Set()
  for (const section of run.topology) {
    if (topologyIds.has(section.id)) {
      errors.push(`${location}.topology: duplicate section id ${section.id}`)
    }

    if (topologyOrders.has(section.order)) {
      errors.push(`${location}.topology: duplicate section order ${section.order}`)
    }

    topologyIds.add(section.id)
    topologyOrders.add(section.order)
  }

  const assetPaths = new Set()
  for (const asset of run.assets) {
    if (assetPaths.has(asset.localPath)) {
      errors.push(`${location}.assets: duplicate localPath ${asset.localPath}`)
    }

    assetPaths.add(asset.localPath)
  }

  const specPaths = new Set(run.componentSpecs)
  if (specPaths.size !== run.componentSpecs.length) {
    errors.push(`${location}.componentSpecs: paths must be unique`)
  }

  if (run.status !== 'recon-complete' && run.componentSpecs.length === 0) {
    errors.push(`${location}.componentSpecs: at least one spec is required after reconnaissance`)
  }
}

function collectRunFiles(inputPath) {
  if (!existsSync(inputPath)) {
    throw new Error(`Artifact path does not exist: ${relative(ROOT, inputPath) || inputPath}`)
  }

  if (statSync(inputPath).isFile()) {
    if (basename(inputPath) !== 'run.json') {
      throw new Error('A file input must be named run.json')
    }

    return [inputPath]
  }

  const runFiles = []
  for (const entry of readdirSync(inputPath, { withFileTypes: true })) {
    const entryPath = join(inputPath, entry.name)

    if (entry.isDirectory()) {
      runFiles.push(...collectRunFiles(entryPath))
    }

    if (entry.isFile() && entry.name === 'run.json') {
      runFiles.push(entryPath)
    }
  }

  return runFiles
}

function main() {
  const inputArgument = process.argv[2]
  const inputPath = inputArgument ? resolve(ROOT, inputArgument) : DEFAULT_RESEARCH_DIRECTORY
  const runSchema = readJson(RUN_SCHEMA_PATH)
  const runFiles = collectRunFiles(inputPath)

  if (runFiles.length === 0) {
    throw new Error(`No run.json artifact found under ${relative(ROOT, inputPath) || '.'}`)
  }

  const errors = []
  for (const runPath of runFiles) {
    const run = readJson(runPath)
    const location = relative(ROOT, runPath)
    validateValue(run, runSchema, location, errors)

    if (isPlainObject(run) && Array.isArray(run.viewports) && Array.isArray(run.screenshots) && Array.isArray(run.topology) && Array.isArray(run.assets) && Array.isArray(run.componentSpecs)) {
      validateRunSemantics(run, location, errors)
    }
  }

  if (errors.length > 0) {
    console.error('Artifact validation failed:')
    errors.forEach((error) => console.error(`  - ${error}`))
    process.exitCode = 1
    return
  }

  console.log(`Validated ${runFiles.length} clone research run artifact(s).`)
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
