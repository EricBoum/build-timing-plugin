# webpack-module-timing-plugin

A webpack plugin for finding slow source files during compilation.

It reports:

- The slowest files in the current build
- A phase summary for module build, optimize, and emit work
- Vue SFC part timings for `template`, `script`, and `style`

It is designed for teams who want a quick terminal-first answer to:

- Which source files are slowing down the build?
- Is the time spent in module compilation, optimization, or emit?
- Inside a `.vue` file, which part is expensive?

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

- Homepage: https://github.com/EricBoum/build-timing-plugin
- Issues: https://github.com/EricBoum/build-timing-plugin/issues

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

## Release Checklist

Before publishing:

1. Verify the package name is still available on npm.
2. Bump `version` in `package.json`.
3. Add CI for `npm test`.
4. Publish with `npm publish --access public`.

## License

MIT
