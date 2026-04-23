# webpack-module-timing-plugin

A webpack plugin that reports per-file build timings, including Vue SFC parts such as `template`, `script`, and `style`.

It is designed for teams who want a quick terminal-first answer to:

- Which source files are slowing down the build?
- Is the time spent in module compilation, optimization, or emit?
- Inside a `.vue` file, which part is expensive?

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

## Release Checklist

Before publishing:

1. Update `name`, `version`, `author`, `repository`, and `homepage` in `package.json`.
2. Add a real Git repository and remote.
3. Add CI for `npm test`.
4. Publish with `npm publish --access public`.

## License

MIT
