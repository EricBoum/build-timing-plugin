const path = require('path')

const PLUGIN_NAME = 'WebpackModuleTimingPlugin'

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
}

const NO_COLOR = Object.keys(ANSI).reduce((acc, key) => {
  acc[key] = ''
  return acc
}, {})

const PART_CONFIG = {
  template: { tone: 'yellow', label: 'template' },
  script: { tone: 'cyan', label: 'script  ' },
  style: { tone: 'green', label: 'style   ' },
  main: { tone: 'blue', label: 'module  ' },
  entry: { tone: 'white', label: 'entry   ' },
}

const DEFAULTS = {
  topN: 15,
  filter: /[\\/]src[\\/]/,
  showParts: true,
  showEntries: false,
  barWidth: 24,
  context: process.cwd(),
  colors: true,
  writer: (report) => {
    console.log(report)
  },
}

function getTheme(enabled) {
  return enabled ? ANSI : NO_COLOR
}

function timeColor(ms, theme) {
  if (ms >= 800) return theme.red
  if (ms >= 400) return theme.yellow
  return theme.green
}

function makeBar(value, max, barWidth) {
  if (max <= 0 || value <= 0) return ''
  const filled = Math.max(1, Math.round((value / max) * barWidth))
  return '█'.repeat(Math.min(barWidth, filled))
}

function parseVueType(resourceQuery) {
  if (!resourceQuery || !resourceQuery.includes('?vue')) return null
  const match = resourceQuery.match(/[?&]type=(\w+)/)
  return match ? match[1] : 'entry'
}

function splitResource(mod) {
  let resource = mod && mod.resource ? mod.resource : ''
  let resourceQuery = mod && mod.resourceQuery ? mod.resourceQuery : ''

  if (!resourceQuery && resource.includes('?')) {
    const queryIndex = resource.indexOf('?')
    resourceQuery = resource.slice(queryIndex)
    resource = resource.slice(0, queryIndex)
  }

  return { resource, resourceQuery }
}

function matchesFilter(filter, resource) {
  if (!filter) return true

  if (filter instanceof RegExp) {
    filter.lastIndex = 0
    return filter.test(resource)
  }

  if (typeof filter === 'function') {
    return Boolean(filter(resource))
  }

  return true
}

function formatMs(ms) {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s `
  return `${ms}ms`
}

function toRelativePath(absPath, context) {
  if (!absPath) return ''
  const relPath = path.relative(context || process.cwd(), absPath)
  if (!relPath || relPath.startsWith('..')) {
    return absPath.replace(/\\/g, '/')
  }

  return relPath.replace(/\\/g, '/')
}

function line(char, width) {
  return char.repeat(width)
}

function pushPhaseLine(lines, theme, totalMs, label, ms, color) {
  if (ms == null || ms < 0) return

  const bar = `${color}${makeBar(ms, totalMs, 20)}${theme.reset}`
  const suffix = ms > totalMs * 0.5 ? ` ${theme.red}${theme.bold}<- bottleneck${theme.reset}` : ''
  lines.push(
    `${theme.bold}│${theme.reset}  ${theme.dim}${label.padEnd(18)}${theme.reset}  ${bar}  ${timeColor(ms, theme)}${formatMs(ms).padStart(8)}${theme.reset}${suffix}`,
  )
}

function createReport(payload, options) {
  const {
    entries,
    totalMs,
    fileCount,
    phases,
    isIncremental,
  } = payload
  const {
    topN,
    showParts,
    showEntries,
    barWidth,
    context,
    colors,
  } = options

  if (!entries.length) return ''

  const theme = getTheme(colors)
  const lineWidth = 72
  const topEntries = entries.slice(0, topN)
  const maxTotal = topEntries[0] ? topEntries[0][1].total : 0

  const modulesBuildMs = phases.finishModules != null ? phases.finishModules - phases.startTime : null
  const sealMs = phases.finishModules != null && phases.beforeHash != null
    ? phases.beforeHash - phases.finishModules
    : null
  const hashMs = phases.beforeHash != null && phases.afterHash != null
    ? phases.afterHash - phases.beforeHash
    : null
  const moduleAssetsMs = phases.afterHash != null && phases.beforeModuleAssets != null
    ? phases.beforeModuleAssets - phases.afterHash
    : null
  const chunkAssetsMs = phases.beforeModuleAssets != null && phases.beforeChunkAssets != null
    ? phases.beforeChunkAssets - phases.beforeModuleAssets
    : null
  const afterChunkAssetsMs = phases.beforeChunkAssets != null && phases.emit != null
    ? phases.emit - phases.beforeChunkAssets
    : null
  const emitMs = phases.emit != null && phases.afterEmit != null
    ? phases.afterEmit - phases.emit
    : null
  const afterEmitMs = phases.afterEmit != null && phases.endTime != null
    ? phases.endTime - phases.afterEmit
    : null

  const tag = isIncremental
    ? `${theme.cyan}[incremental rebuild]${theme.reset}`
    : `${theme.magenta}[initial build]${theme.reset}`

  const lines = []
  lines.push('')
  lines.push(`${theme.bold}┌${line('─', lineWidth)}┐${theme.reset}`)
  lines.push(
    `${theme.bold}│${theme.reset}  ${theme.bold}Webpack Module Timing${theme.reset}  ${tag}  total: ${theme.bold}${formatMs(totalMs)}${theme.reset}  files: ${theme.bold}${fileCount}${theme.reset}`,
  )
  lines.push(`${theme.bold}├${line('─', lineWidth)}┤${theme.reset}`)

  if (modulesBuildMs != null) {
    lines.push(`${theme.bold}│${theme.reset}  ${theme.dim}Build phases${theme.reset}`)
    pushPhaseLine(lines, theme, totalMs, 'module build', modulesBuildMs, theme.cyan)
    pushPhaseLine(lines, theme, totalMs, 'seal / optimize', sealMs, theme.yellow)
    pushPhaseLine(lines, theme, totalMs, '  hash', hashMs, theme.dim)
    pushPhaseLine(lines, theme, totalMs, '  module assets', moduleAssetsMs, theme.dim)
    pushPhaseLine(lines, theme, totalMs, '  chunk assets', chunkAssetsMs, theme.dim)
    pushPhaseLine(lines, theme, totalMs, '  post process', afterChunkAssetsMs, theme.magenta)
    pushPhaseLine(lines, theme, totalMs, 'emit', emitMs, theme.green)
    pushPhaseLine(lines, theme, totalMs, 'afterEmit -> done', afterEmitMs, theme.dim)
    lines.push(`${theme.bold}│${theme.reset}`)
    lines.push(`${theme.bold}├${line('─', lineWidth)}┤${theme.reset}`)
  }

  const header = `  ${'rank'.padEnd(4)}  ${'file'.padEnd(48)}  ${'total'.padStart(8)}`
  lines.push(`${theme.bold}│${theme.reset}${theme.dim}${header}${theme.reset}`)
  lines.push(`${theme.bold}├${line('─', lineWidth)}┤${theme.reset}`)

  topEntries.forEach(([resource, data], index) => {
    const rank = `#${index + 1}`.padEnd(4)
    const relPath = toRelativePath(resource, context)
    const truncated = relPath.length > 48 ? `...${relPath.slice(-45)}` : relPath.padEnd(48)
    const total = `${timeColor(data.total, theme)}${theme.bold}${formatMs(data.total)}${theme.reset}`

    lines.push(`${theme.bold}│${theme.reset}  ${theme.dim}${rank}${theme.reset}  ${truncated}  ${total}`)

    if (showParts) {
      const partKeys = Object.keys(data.parts)
        .filter((key) => data.parts[key] > 0)
        .filter((key) => key !== 'entry' || showEntries)
        .sort((a, b) => data.parts[b] - data.parts[a])

      partKeys.forEach((key, partIndex) => {
        const config = PART_CONFIG[key] || { tone: 'white', label: key.padEnd(8) }
        const color = theme[config.tone] || theme.white
        const prefix = partIndex === partKeys.length - 1 ? '└──' : '├──'
        const bar = `${color}${makeBar(data.parts[key], maxTotal, barWidth)}${theme.reset}`
        lines.push(
          `${theme.bold}│${theme.reset}       ${theme.dim}${prefix}${theme.reset} ${color}${config.label}${theme.reset}  ${bar}  ${timeColor(data.parts[key], theme)}${formatMs(data.parts[key]).padStart(7)}${theme.reset}`,
        )
      })

      if (index < topEntries.length - 1) {
        lines.push(`${theme.bold}│${theme.reset}`)
      }
    }
  })

  lines.push(`${theme.bold}└${line('─', lineWidth)}┘${theme.reset}`)

  return lines.join('\n')
}

function tapIfExists(hooks, hookName, pluginName, handler) {
  const hook = hooks && hooks[hookName]
  if (hook && typeof hook.tap === 'function') {
    hook.tap(pluginName, handler)
  }
}

function normalizeOptions(options = {}) {
  const showEntries = typeof options.showEntries === 'boolean'
    ? options.showEntries
    : Boolean(options.showAll)

  return {
    ...DEFAULTS,
    ...options,
    showEntries,
    context: options.context || process.cwd(),
    writer: typeof options.writer === 'function' ? options.writer : DEFAULTS.writer,
  }
}

class WebpackModuleTimingPlugin {
  constructor(options = {}) {
    this.options = normalizeOptions(options)
    this.fileTimings = new Map()
    this.startTimes = new Map()
    this.buildCount = 0
    this.phases = {}
  }

  apply(compiler) {
    tapIfExists(compiler.hooks, 'compilation', PLUGIN_NAME, (compilation) => {
      tapIfExists(compilation.hooks, 'finishModules', PLUGIN_NAME, () => {
        this.phases.finishModules = Date.now()
      })
      tapIfExists(compilation.hooks, 'seal', PLUGIN_NAME, () => {
        this.phases.seal = Date.now()
      })
      tapIfExists(compilation.hooks, 'beforeHash', PLUGIN_NAME, () => {
        this.phases.beforeHash = Date.now()
      })
      tapIfExists(compilation.hooks, 'afterHash', PLUGIN_NAME, () => {
        this.phases.afterHash = Date.now()
      })
      tapIfExists(compilation.hooks, 'beforeModuleAssets', PLUGIN_NAME, () => {
        this.phases.beforeModuleAssets = Date.now()
      })
      tapIfExists(compilation.hooks, 'beforeChunkAssets', PLUGIN_NAME, () => {
        this.phases.beforeChunkAssets = Date.now()
      })

      tapIfExists(compilation.hooks, 'buildModule', PLUGIN_NAME, (mod) => {
        this.startTimes.set(mod, Date.now())
      })

      const finishModule = (mod) => {
        this.recordModuleTiming(mod)
      }

      tapIfExists(compilation.hooks, 'succeedModule', PLUGIN_NAME, finishModule)
      tapIfExists(compilation.hooks, 'failedModule', PLUGIN_NAME, finishModule)
    })

    tapIfExists(compiler.hooks, 'emit', PLUGIN_NAME, () => {
      this.phases.emit = Date.now()
    })

    tapIfExists(compiler.hooks, 'afterEmit', PLUGIN_NAME, () => {
      this.phases.afterEmit = Date.now()
    })

    tapIfExists(compiler.hooks, 'done', PLUGIN_NAME, (stats) => {
      this.buildCount += 1
      const report = this.createReport(stats)

      if (report) {
        this.options.writer(report, {
          stats,
          entries: [...this.fileTimings.entries()],
        })
      }

      this.fileTimings.clear()
      this.startTimes.clear()
      this.phases = {}
    })
  }

  recordModuleTiming(mod) {
    const start = this.startTimes.get(mod)
    if (start == null) return

    this.startTimes.delete(mod)

    const { resource, resourceQuery } = splitResource(mod)
    if (!resource || !matchesFilter(this.options.filter, resource)) return

    const cost = Date.now() - start
    const vueType = parseVueType(resourceQuery)

    let partKey = 'main'
    let includeInTotal = true

    if (vueType === 'entry') {
      partKey = 'entry'
      includeInTotal = false
    } else if (vueType && vueType !== 'entry') {
      partKey = vueType
    }

    if (!this.fileTimings.has(resource)) {
      this.fileTimings.set(resource, {
        total: 0,
        parts: {},
      })
    }

    const timing = this.fileTimings.get(resource)
    timing.parts[partKey] = (timing.parts[partKey] || 0) + cost

    if (includeInTotal) {
      timing.total += cost
    }
  }

  createReport(stats) {
    const entries = [...this.fileTimings.entries()]
      .sort((a, b) => b[1].total - a[1].total)

    if (!entries.length) return ''

    return createReport({
      entries,
      totalMs: stats.endTime - stats.startTime,
      fileCount: entries.length,
      phases: {
        ...this.phases,
        startTime: stats.startTime,
        endTime: stats.endTime,
      },
      isIncremental: this.buildCount > 1,
    }, this.options)
  }
}

WebpackModuleTimingPlugin.pluginName = PLUGIN_NAME
WebpackModuleTimingPlugin.createReport = createReport

module.exports = WebpackModuleTimingPlugin
module.exports.WebpackModuleTimingPlugin = WebpackModuleTimingPlugin
module.exports.BuildTimingPlugin = WebpackModuleTimingPlugin
module.exports.createReport = createReport
