import {
  REPORT_NO_INTEGRATION,
  REPORT_NO_MEETING,
  REPORT_NO_TEMPLATE,
  REPORT_NO_USER,
  REPORT_OTHER_TEAM_TEMPLATE,
  REPORT_STRUCTURE_NOT_SET,
  REPORT_STRUCTURE_REMOVED,
  type ReportDimension
} from '../../shared/reports/reportCatalog'

export interface ReportSeriesColor {
  // a swatch in the page's own markup
  className: string
  // the same color for the canvas, which can't read the theme's tokens
  light: string
  dark: string
}

const color = (className: string, light: string, dark = light): ReportSeriesColor => ({
  className,
  light,
  dark
})

// paletteV3, dark enough to stand 3:1 off the card in either theme
const NONE_COLOR = color('bg-slate-600 dark:bg-slate-500', '#82809A', '#A7A3C2')
export const REPORT_NONE_COLOR = NONE_COLOR

const KNOWN_COLORS: Partial<Record<ReportDimension, Record<string, ReportSeriesColor>>> = {
  MEETING_TYPE: {
    retrospective: color('bg-grape-500', '#A06BD6'),
    teamPrompt: color('bg-jade-700 dark:bg-jade-500', '#1D8647', '#40B574'),
    action: color('bg-aqua-600 dark:bg-aqua-200', '#2792AA', '#A4DEE5'),
    poker: color('bg-tomato-800 dark:bg-tomato-600', '#9F201E', '#F23B31'),
    teamHealth: color('bg-rose-500 dark:bg-rose-300', '#ED4C86', '#F099BF'),
    [REPORT_NO_MEETING]: NONE_COLOR
  },
  DONE_OR_OPEN: {
    done: color('bg-grape-600 dark:bg-grape-300', '#7340B5', '#AF6BD6'),
    open: NONE_COLOR
  },
  TASK_STATUS: {
    done: color('bg-grape-600 dark:bg-grape-300', '#7340B5', '#AF6BD6'),
    active: color('bg-jade-600 dark:bg-jade-400', '#2D9F5F', '#66BC8C'),
    stuck: color('bg-tomato-500', '#FD6157'),
    future: color('bg-aqua-600 dark:bg-aqua-400', '#2792AA', '#55C0CF')
  },
  // older tasks are darker in the light theme, and every age keeps its place in the stack
  TASK_AGE: {
    under30Days: color('bg-sky-500', '#329AE5'),
    from30To90Days: color('bg-grape-500', '#A06BD6'),
    from90To180Days: color('bg-gold-600 dark:bg-gold-400', '#A36200', '#FBB337'),
    over180Days: color('bg-tomato-800 dark:bg-tomato-600', '#9F201E', '#F23B31')
  },
  USER: {
    [REPORT_NO_USER]: NONE_COLOR
  },
  TEAM_LEVEL: {
    [REPORT_STRUCTURE_NOT_SET]: NONE_COLOR,
    [REPORT_STRUCTURE_REMOVED]: NONE_COLOR
  },
  TEMPLATE: {
    [REPORT_NO_TEMPLATE]: NONE_COLOR,
    [REPORT_OTHER_TEAM_TEMPLATE]: NONE_COLOR
  },
  INTEGRATION: {
    [REPORT_NO_INTEGRATION]: NONE_COLOR
  }
}

// teams and anything else without a color of its own, in the order series are ranked
const SERIES_COLORS = [
  color('bg-grape-500', '#A06BD6'),
  color('bg-sky-500', '#329AE5'),
  color('bg-gold-600 dark:bg-gold-400', '#A36200', '#FBB337'),
  color('bg-jade-600 dark:bg-jade-400', '#2D9F5F', '#66BC8C'),
  color('bg-tomato-500', '#FD6157'),
  color('bg-aqua-700 dark:bg-aqua-300', '#1C748D', '#7CCFD9')
]

export const REPORT_SINGLE_SERIES_COLOR = SERIES_COLORS[0]!

export const getReportSeriesColor = (
  dimension: ReportDimension | undefined,
  value: string,
  rank: number
) => (dimension && KNOWN_COLORS[dimension]?.[value]) ?? SERIES_COLORS[rank % SERIES_COLORS.length]!

// A flow colors the values that have colors of their own, like meeting types, and draws the rest in gray
const FLOW_COLORED_DIMENSIONS: readonly ReportDimension[] = [
  'MEETING_TYPE',
  'TASK_STATUS',
  'DONE_OR_OPEN',
  'TASK_AGE'
]

export const getReportFlowColor = (dimension: ReportDimension, value: string, rank: number) =>
  FLOW_COLORED_DIMENSIONS.includes(dimension)
    ? getReportSeriesColor(dimension, value, rank)
    : NONE_COLOR
