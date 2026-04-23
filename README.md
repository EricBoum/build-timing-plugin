# webpack-module-timing-plugin

[![npm version](https://img.shields.io/npm/v/webpack-module-timing-plugin.svg)](https://www.npmjs.com/package/webpack-module-timing-plugin)
[![CI](https://img.shields.io/github/actions/workflow/status/EricBoum/webpack-module-timing-plugin/ci.yml?branch=main&label=ci)](https://github.com/EricBoum/webpack-module-timing-plugin/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/webpack-module-timing-plugin.svg)](https://github.com/EricBoum/webpack-module-timing-plugin/blob/main/LICENSE)

Find the slowest files in your webpack build.

`webpack-module-timing-plugin` gives you a terminal-first timing report that answers:

- Which source files are expensive to compile?
- Is the time going into module build, optimize, or emit?
- In a Vue SFC, is the slowdown in `template`, `script`, or `style`?

It reports:

- The slowest files in the current build
- A phase summary for module build, optimize, and emit work
- Vue SFC part timings for `template`, `script`, and `style`

## Quick Start

```bash
npm install --save-dev webpack-module-timing-plugin
```

```js
const WebpackModuleTimingPlugin = require('webpack-module-timing-plugin')

module.exports = {
  plugins: [
    new WebpackModuleTimingPlugin(),
  ],
}
```

## At A Glance

- File-level timing reports for webpack builds
- Vue SFC timing breakdowns out of the box
- Helpful for both initial builds and incremental rebuilds
- Lightweight output that fits directly in the terminal

## Why This Plugin

Many webpack performance tools focus on the whole build, individual loaders, or bundle size.

This plugin focuses on a different question:

> Which source files are the slowest to compile right now?

That makes it useful when you are trying to:

- Find a handful of expensive files in a large app
- Understand whether a slow Vue file is heavy in `template`, `script`, or `style`
- Compare first build and incremental rebuild hotspots
- Give teammates a simple terminal report without extra dashboards

## Features

- Per-file timing ranking
- Optional Vue SFC part breakdown
- Build phase summary
- Works with webpack 4 and webpack 5
- Zero runtime dependencies

## Install

```bash
npm install --save-dev webpack-module-timing-plugin
```

## Repository

- Homepage: https://github.com/EricBoum/webpack-module-timing-plugin
- Issues: https://github.com/EricBoum/webpack-module-timing-plugin/issues

## Usage

```js
const WebpackModuleTimingPlugin = require('webpack-module-timing-plugin')

module.exports = {
  plugins: [
    new WebpackModuleTimingPlugin({
      topN: 20,
      filter: /[\\/]src[\\/]/,
      showParts: true,
      showEntries: false,
    }),
  ],
}
```

## Common Use Cases

- Investigating a suddenly slow local rebuild after a feature branch grows
- Finding which Vue page or shared component is dominating compile time
- Spot-checking whether a build slowdown comes from source transforms or later webpack phases
- Sharing a low-friction build performance signal with the team during optimization work

## What It Measures

- Module build time, grouped by source file
- A build phase summary using webpack compiler hooks
- Vue SFC child module timings derived from `vue-loader` resource queries

## What It Does Not Measure

- Exact loader-by-loader timing
- Bundle size or output chunk analysis
- A perfect wall-clock profiler for every internal webpack step

The report is designed to be actionable and lightweight, not a full tracing system.

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `topN` | `number` | `15` | Show the slowest N files. |
| `filter` | `RegExp \| (resource) => boolean` | `/[\\/]src[\\/]/` | Limit tracked files. |
| `showParts` | `boolean` | `true` | Show per-part details below each file. |
| `showEntries` | `boolean` | `false` | Show Vue entry aggregation rows without adding them to total time. |
| `barWidth` | `number` | `24` | Width of the timing bars. |
| `context` | `string` | `process.cwd()` | Base directory used for relative paths. |
| `colors` | `boolean` | `true` | Enable ANSI colors in terminal output. |
| `writer` | `(report, payload) => void` | `console.log` | Custom output hook. |

`showAll` is also accepted as a backward-compatible alias of `showEntries`.

## Example Output

```text
┌────────────────────────────────────────────────────────────────────────┐
│  Webpack Module Timing  [initial build]  total: 8.34s  files: 12
├────────────────────────────────────────────────────────────────────────┤
│  Build phases
│  module build          ██████████████        5.28s
│  seal / optimize       ███                   1.06s
│  emit                  ██                    612ms
├────────────────────────────────────────────────────────────────────────┤
│  rank  file                                                total
├────────────────────────────────────────────────────────────────────────┤
│  #1    src/pages/home/index.vue                           1.42s
│       ├── template  ██████████████                         673ms
│       ├── script    ███████                                411ms
│       └── style     ███                                    192ms
└────────────────────────────────────────────────────────────────────────┘
```

## When To Use It

- Your webpack build feels slow, but the normal output is too coarse
- You want file-level timing without introducing a heavy profiling workflow
- Your project uses Vue SFCs and you want to see whether the bottleneck lives in `template`, `script`, or `style`

## Changelog

See [CHANGELOG.md](https://github.com/EricBoum/webpack-module-timing-plugin/blob/main/CHANGELOG.md).

## Release Checklist

Before publishing:

1. Verify the package name is still available on npm.
2. Bump `version` in `package.json`.
3. Add CI for `npm test`.
4. Publish with `npm publish --access public`.

## License

MIT
