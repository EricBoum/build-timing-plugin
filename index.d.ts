export interface WebpackModuleTimingPluginOptions {
  topN?: number
  filter?: RegExp | ((resource: string) => boolean)
  showParts?: boolean
  showEntries?: boolean
  showAll?: boolean
  barWidth?: number
  context?: string
  colors?: boolean
  writer?: (report: string, payload: { stats: unknown; entries: Array<[string, { total: number; parts: Record<string, number> }]> }) => void
}

export interface TimingEntry {
  total: number
  parts: Record<string, number>
}

export declare function createReport(
  payload: {
    entries: Array<[string, TimingEntry]>
    totalMs: number
    fileCount: number
    phases: Record<string, number>
    isIncremental: boolean
  },
  options: WebpackModuleTimingPluginOptions,
): string

declare class WebpackModuleTimingPlugin {
  constructor(options?: WebpackModuleTimingPluginOptions)
  apply(compiler: unknown): void
  createReport(stats: { startTime: number; endTime: number }): string

  static pluginName: string
  static createReport: typeof createReport
}

export { WebpackModuleTimingPlugin }
export default WebpackModuleTimingPlugin
