const test = require('node:test')
const assert = require('node:assert/strict')

const { createReport } = require('..')

test('createReport renders ranked module timings', () => {
  const report = createReport({
    entries: [
      [
        '/workspace/src/App.vue',
        {
          total: 420,
          parts: {
            template: 120,
            script: 210,
            style: 90,
          },
        },
      ],
    ],
    totalMs: 1000,
    fileCount: 1,
    phases: {
      startTime: 0,
      finishModules: 500,
      beforeHash: 700,
      afterHash: 750,
      emit: 900,
      afterEmit: 950,
      endTime: 1000,
    },
    isIncremental: false,
  }, {
    topN: 10,
    showParts: true,
    showEntries: false,
    barWidth: 8,
    context: '/workspace',
    colors: false,
  })

  assert.match(report, /Webpack Module Timing/)
  assert.match(report, /src\/App\.vue/)
  assert.match(report, /template/)
  assert.match(report, /420ms/)
})
