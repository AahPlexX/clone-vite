#!/usr/bin/env node

/**
 * Captures deterministic baseline evidence for one authorized public website
 * through a locally exposed Chrome DevTools Protocol endpoint.
 *
 * Usage:
 *   node scripts/extract-site.mjs --url=https://example.com --authorized
 *   node scripts/extract-site.mjs --url=https://example.com --authorized --endpoint=http://127.0.0.1:9222 --force
 */

import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DEFAULT_ENDPOINT = 'http://127.0.0.1:9222'
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 1200 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
]

class CdpClient {
  constructor(webSocketUrl) {
    this.webSocketUrl = webSocketUrl
    this.socket = null
    this.nextId = 1
    this.pending = new Map()
  }

  async connect() {
    if (typeof WebSocket !== 'function') {
      throw new Error('This command requires Node 22 with the built-in WebSocket API.')
    }

    this.socket = new WebSocket(this.webSocketUrl)
    this.socket.addEventListener('message', (event) => this.handleMessage(event))
    this.socket.addEventListener('close', () => this.rejectPending('Chrome DevTools connection closed.'))
    this.socket.addEventListener('error', () => this.rejectPending('Chrome DevTools connection failed.'))

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timed out while connecting to Chrome DevTools.')), 10_000)
      this.socket.addEventListener('open', () => {
        clearTimeout(timeout)
        resolve()
      }, { once: true })
      this.socket.addEventListener('error', () => {
        clearTimeout(timeout)
        reject(new Error('Could not connect to Chrome DevTools.'))
      }, { once: true })
    })
  }

  handleMessage(event) {
    const raw = typeof event.data === 'string' ? event.data : Buffer.from(event.data).toString('utf8')
    const message = JSON.parse(raw)

    if (!message.id) {
      return
    }

    const pending = this.pending.get(message.id)
    if (!pending) {
      return
    }

    this.pending.delete(message.id)

    if (message.error) {
      pending.reject(new Error(`${pending.method}: ${message.error.message}`))
      return
    }

    pending.resolve(message.result ?? {})
  }

  send(method, params = {}) {
    if (!this.socket || this.socket.readyState !== 1) {
      return Promise.reject(new Error('Chrome DevTools is not connected.'))
    }

    const id = this.nextId++
    this.socket.send(JSON.stringify({ id, method, params }))

    return new Promise((resolve, reject) => {
      this.pending.set(id, { method, resolve, reject })
    })
  }

  rejectPending(message) {
    for (const pending of this.pending.values()) {
      pending.reject(new Error(message))
    }

    this.pending.clear()
  }

  close() {
    this.socket?.close()
  }
}

function parseArguments(argumentsList) {
  const options = {
    authorized: false,
    endpoint: DEFAULT_ENDPOINT,
    force: false,
    url: null,
  }

  for (const argument of argumentsList) {
    if (argument === '--authorized') {
      options.authorized = true
      continue
    }

    if (argument === '--force') {
      options.force = true
      continue
    }

    if (argument.startsWith('--url=')) {
      options.url = argument.slice('--url='.length)
      continue
    }

    if (argument.startsWith('--endpoint=')) {
      options.endpoint = argument.slice('--endpoint='.length)
      continue
    }

    throw new Error(`Unknown argument: ${argument}`)
  }

  if (!options.authorized) {
    throw new Error('Pass --authorized only when you have permission to inspect and reproduce the target.')
  }

  if (!options.url) {
    throw new Error('Pass a target URL with --url=https://example.com.')
  }

  return options
}

function parsePublicUrl(value, label) {
  let parsed

  try {
    parsed = new URL(value)
  } catch {
    throw new Error(`${label} must be an absolute URL.`)
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`${label} must use http or https.`)
  }

  if (parsed.username || parsed.password) {
    throw new Error(`${label} must not contain credentials.`)
  }

  return parsed
}

function assertEndpointIsSafe(endpoint, allowRemoteEndpoint) {
  const parsed = parsePublicUrl(endpoint, 'Chrome DevTools endpoint')
  const localHosts = new Set(['127.0.0.1', '::1', 'localhost'])

  if (!localHosts.has(parsed.hostname) && !allowRemoteEndpoint) {
    throw new Error('Chrome DevTools endpoint must be localhost. Use a local port forward for remote browsers.')
  }

  return parsed
}

function slugifyHostname(hostname) {
  return hostname.toLowerCase().replace(/[^a-z0-9.-]/g, '-')
}

function assetExtension(sourceUrl, kind) {
  const extension = new URL(sourceUrl).pathname.match(/\.([a-z0-9]{2,5})$/i)?.[1]?.toLowerCase()
  if (extension) {
    return `.${extension}`
  }

  return {
    favicon: '.ico',
    font: '.woff2',
    image: '.bin',
    svg: '.svg',
    video: '.mp4',
  }[kind] ?? '.bin'
}

function localAssetPath(hostname, sourceUrl, kind) {
  const hash = createHash('sha256').update(sourceUrl).digest('hex').slice(0, 16)
  return `public/clones/${hostname}/assets/${hash}${assetExtension(sourceUrl, kind)}`
}

function normalizeTopology(topology) {
  const identifiers = new Map()
  const normalized = topology.map((section, order) => {
    const baseId = section.id || `section-${order + 1}`
    const occurrence = identifiers.get(baseId) ?? 0
    identifiers.set(baseId, occurrence + 1)

    return {
      ...section,
      id: occurrence === 0 ? baseId : `${baseId}-${occurrence + 1}`,
      order,
    }
  })

  if (normalized.length === 0) {
    return [{ id: 'body', order: 0, selector: 'body', interactionModel: 'static' }]
  }

  return normalized
}

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function evaluate(client, expression, awaitPromise = false) {
  const response = await client.send('Runtime.evaluate', {
    expression,
    awaitPromise,
    returnByValue: true,
  })

  if (response.exceptionDetails) {
    throw new Error(`Page evaluation failed: ${response.exceptionDetails.text ?? 'Unknown page error.'}`)
  }

  if (!('value' in response.result)) {
    throw new Error('Page evaluation did not return serializable data.')
  }

  return response.result.value
}

async function waitForDocument(client) {
  const deadline = Date.now() + 20_000

  while (Date.now() < deadline) {
    const readyState = await evaluate(client, 'document.readyState')
    if (readyState === 'complete') {
      await evaluate(client, 'Promise.all([document.fonts?.ready ?? Promise.resolve(), new Promise((resolve) => setTimeout(resolve, 500))])', true)
      return
    }

    await wait(150)
  }

  throw new Error('Timed out waiting for the target document to finish loading.')
}

async function createDedicatedTarget(endpoint, targetUrl) {
  const createUrl = new URL(`/json/new?${encodeURIComponent(targetUrl)}`, endpoint)
  const response = await fetch(createUrl, { method: 'PUT' })

  if (!response.ok) {
    throw new Error(`Chrome DevTools could not create a dedicated page (${response.status}).`)
  }

  const target = await response.json()
  if (!target.id || !target.webSocketDebuggerUrl) {
    throw new Error('Chrome DevTools returned an incomplete page target.')
  }

  return target
}

async function closeDedicatedTarget(endpoint, targetId) {
  const closeUrl = new URL(`/json/close/${targetId}`, endpoint)

  try {
    await fetch(closeUrl)
  } catch {
    // The page is disposable. A failed cleanup must not hide captured evidence.
  }
}

async function captureScreenshot(client, viewport, outputPath) {
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await evaluate(client, 'new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))', true)

  const response = await client.send('Page.captureScreenshot', {
    captureBeyondViewport: true,
    format: 'png',
    fromSurface: true,
  })

  writeFileSync(outputPath, Buffer.from(response.data, 'base64'))
}

async function collectPageEvidence(client) {
  return evaluate(client, `(() => {
    const asAbsoluteHttpUrl = (value) => {
      try {
        const parsed = new URL(value, window.location.href)
        return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : null
      } catch {
        return null
      }
    }

    const selectorFor = (element) => {
      if (element.id) {
        return '#' + CSS.escape(element.id)
      }

      const parts = []
      let current = element
      while (current && current !== document.body) {
        const siblings = [...current.parentElement.children].filter((sibling) => sibling.tagName === current.tagName)
        const index = siblings.indexOf(current) + 1
        parts.unshift(current.tagName.toLowerCase() + ':nth-of-type(' + index + ')')
        current = current.parentElement
      }

      return 'body > ' + parts.join(' > ')
    }

    const candidates = []
    const addCandidate = (element) => {
      if (element && !candidates.includes(element)) {
        candidates.push(element)
      }
    }

    for (const child of document.body.children) {
      if (['HEADER', 'FOOTER'].includes(child.tagName)) {
        addCandidate(child)
      }
    }

    const main = document.querySelector('main')
    if (main) {
      for (const child of main.children) {
        addCandidate(child)
      }
    } else {
      for (const child of document.body.children) {
        if (!['HEADER', 'FOOTER', 'SCRIPT', 'STYLE'].includes(child.tagName)) {
          addCandidate(child)
        }
      }
    }

    const topology = candidates
      .filter((element) => element.getBoundingClientRect().height > 0)
      .map((element, order) => ({
        id: (element.id || element.getAttribute('aria-label') || element.tagName.toLowerCase() + '-' + (order + 1))
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || 'section-' + (order + 1),
        order,
        selector: selectorFor(element),
        interactionModel: element.querySelector('button, a, input, select, textarea, [role="button"], [role="tab"]') ? 'mixed' : 'static',
      }))

    const assets = new Map()
    const addAsset = (rawUrl, kind) => {
      const sourceUrl = asAbsoluteHttpUrl(rawUrl)
      if (!sourceUrl) {
        return
      }

      const current = assets.get(sourceUrl)
      if (!current || current.kind === 'image') {
        assets.set(sourceUrl, { sourceUrl, kind })
      }
    }

    document.querySelectorAll('img').forEach((image) => addAsset(image.currentSrc || image.src, 'image'))
    document.querySelectorAll('video').forEach((video) => {
      addAsset(video.currentSrc || video.src || video.querySelector('source')?.src, 'video')
      addAsset(video.poster, 'image')
    })
    document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]').forEach((link) => addAsset(link.href, 'favicon'))
    document.querySelectorAll('link[rel="preload"][as="font"]').forEach((link) => addAsset(link.href, 'font'))

    document.querySelectorAll('*').forEach((element) => {
      const background = getComputedStyle(element).backgroundImage
      for (const match of background.matchAll(/url\\((?:"|')?([^"')]+)(?:"|')?\\)/g)) {
        addAsset(match[1], 'image')
      }
    })

    return {
      url: window.location.href,
      topology,
      assets: [...assets.values()],
    }
  })()`)
}

function writeTopologyMarkdown(filePath, targetUrl, topology) {
  const rows = topology.map((section) => `| ${section.order} | ${section.id} | \`${section.selector}\` | ${section.interactionModel} |`).join('\n')
  const content = `# Page Topology\n\n- **Target:** ${targetUrl}\n- **Capture:** deterministic Chrome DevTools baseline\n\n| Order | Section | Selector | Initial interaction classification |\n|---:|---|---|---|\n${rows}\n\nInitial classifications are structural only. Run state exploration before builder dispatch to confirm all interactions.\n`
  writeFileSync(filePath, content, 'utf8')
}

function writeBehaviorMarkdown(filePath, targetUrl) {
  const content = `# Behaviors\n\n- **Target:** ${targetUrl}\n- **Status:** initial static reconnaissance complete\n\nThis file intentionally contains no inferred behavior. Capture scroll, click, hover, timed, and responsive states before dispatching builders.\n`
  writeFileSync(filePath, content, 'utf8')
}

function validateArtifacts(researchDirectory) {
  const result = spawnSync(process.execPath, [join(ROOT, 'scripts', 'validate-artifacts.mjs'), researchDirectory], {
    cwd: ROOT,
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    throw new Error('Captured run did not pass artifact validation.')
  }
}

async function main() {
  const options = parseArguments(process.argv.slice(2))
  const targetUrl = parsePublicUrl(options.url, 'Target URL')
  const endpoint = assertEndpointIsSafe(options.endpoint, false)
  let target = null
  let client = null

  try {
    target = await createDedicatedTarget(endpoint, targetUrl.href)
    client = new CdpClient(target.webSocketDebuggerUrl)
    await client.connect()
    await client.send('Page.enable')
    await client.send('Runtime.enable')
    await waitForDocument(client)

    const evidence = await collectPageEvidence(client)
    const finalUrl = parsePublicUrl(evidence.url, 'Resolved target URL')
    const hostname = slugifyHostname(finalUrl.hostname)
    const researchDirectory = join(ROOT, 'docs', 'research', hostname)
    const referencesDirectory = join(ROOT, 'docs', 'design-references', hostname)
    const runPath = join(researchDirectory, 'run.json')
    const topology = normalizeTopology(evidence.topology)

    if (existsSync(runPath) && !options.force) {
      throw new Error(`${relative(ROOT, runPath)} already exists. Pass --force to replace this target's baseline evidence.`)
    }

    mkdirSync(researchDirectory, { recursive: true })
    mkdirSync(referencesDirectory, { recursive: true })

    const screenshots = []
    for (const viewport of VIEWPORTS) {
      const path = `docs/design-references/${hostname}/${viewport.name}-full.png`
      await captureScreenshot(client, viewport, join(ROOT, path))
      screenshots.push({ viewport: viewport.name, path, fullPage: true })
    }

    const assets = evidence.assets.map((asset) => ({
      ...asset,
      localPath: localAssetPath(hostname, asset.sourceUrl, asset.kind),
    }))

    writeJson(runPath, {
      schemaVersion: '1.0',
      target: {
        url: finalUrl.href,
        hostname,
        authorized: true,
      },
      capturedAt: new Date().toISOString(),
      status: 'recon-complete',
      viewports: VIEWPORTS,
      screenshots,
      topology,
      assets,
      componentSpecs: [],
    })
    writeTopologyMarkdown(join(researchDirectory, 'PAGE_TOPOLOGY.md'), finalUrl.href, topology)
    writeBehaviorMarkdown(join(researchDirectory, 'BEHAVIORS.md'), finalUrl.href)
    validateArtifacts(researchDirectory)

    console.log(`Captured baseline evidence for ${finalUrl.href}`)
    console.log(`Research: ${relative(ROOT, researchDirectory)}`)
  } finally {
    client?.close()
    if (target?.id) {
      await closeDedicatedTarget(endpoint, target.id)
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
