import type {ReportMeasureKind} from '../../shared/reports/reportCatalog'

// A Health score is shaded by the answer it rounds to, so a shade means the same in every report. The ends are dark
// enough that the middle never blurs with either
export const HEALTH_SCORE_SHADES = [
  {label: 'Strongly disagree', className: 'bg-tomato-700/30 dark:bg-tomato-500/50'},
  {label: 'Disagree', className: 'bg-tomato-400/26 dark:bg-tomato-500/28'},
  {label: 'Neutral', className: 'bg-slate-400/22 dark:bg-slate-600/16'},
  {label: 'Agree', className: 'bg-jade-400/26 dark:bg-jade-500/28'},
  {label: 'Strongly agree', className: 'bg-jade-700/36 dark:bg-jade-500/50'}
] as const

const toAnswerIdx = (score: number) => Math.min(5, Math.max(1, Math.round(score))) - 1

export const healthScoreShadeOf = (score: number) => HEALTH_SCORE_SHADES[toAnswerIdx(score)]!

// each answer at full strength, for a bar or a dot rather than a cell behind text
const HEALTH_ANSWER_COLORS = [
  {bar: 'bg-tomato-700 dark:bg-tomato-500', dot: 'fill-tomato-700 dark:fill-tomato-500'},
  {bar: 'bg-tomato-400 dark:bg-tomato-200', dot: 'fill-tomato-400 dark:fill-tomato-200'},
  {bar: 'bg-slate-400 dark:bg-slate-600', dot: 'fill-slate-400 dark:fill-slate-600'},
  {bar: 'bg-jade-400 dark:bg-jade-200', dot: 'fill-jade-400 dark:fill-jade-200'},
  {bar: 'bg-jade-700 dark:bg-jade-500', dot: 'fill-jade-700 dark:fill-jade-500'}
] as const

export const healthAnswerColorOf = (score: number) => HEALTH_ANSWER_COLORS[toAnswerIdx(score)]!

const COUNT_SHADES = [
  'bg-grape-500/20',
  'bg-grape-500/40 dark:bg-grape-500/35',
  'bg-grape-500/70 dark:bg-grape-500/55'
] as const

const EMPTY_CELL = 'border border-hairline'

// Anything but a score is shaded by its share of the biggest value. The value is printed too, so color never
// carries it alone
export const heatClassName = (kind: ReportMeasureKind, value: number | null, max: number) => {
  if (value === null) return EMPTY_CELL
  if (kind === 'score') return healthScoreShadeOf(value).className
  if (!value || max <= 0) return EMPTY_CELL
  const share = value / max
  return COUNT_SHADES[share <= 1 / 3 ? 0 : share <= 2 / 3 ? 1 : 2]
}

export const countShadeRanges = (max: number) => {
  let low = 1
  return COUNT_SHADES.flatMap((className, idx) => {
    const high = idx === COUNT_SHADES.length - 1 ? max : Math.floor((max * (idx + 1)) / 3)
    if (high < low) return []
    const label =
      idx === COUNT_SHADES.length - 1 && high > low
        ? `${low}+`
        : low === high
          ? `${low}`
          : `${low}–${high}`
    low = high + 1
    return [{label, className}]
  })
}
