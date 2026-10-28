import type {ReportMeasureKind} from '../../shared/reports/reportCatalog'

// A Health score sits on a fixed 1 to 5 scale, so its bands mean the same in every report
export const HEALTH_SCORE_BANDS = [
  {min: 3.5, label: '3.5 and up', className: 'bg-jade-500/25 dark:bg-jade-500/30'},
  {min: 2.5, label: '2.5 to 3.4', className: 'bg-gold-500/30 dark:bg-gold-500/35'},
  {
    min: Number.NEGATIVE_INFINITY,
    label: 'Under 2.5',
    className: 'bg-tomato-500/25 dark:bg-tomato-500/35'
  }
] as const

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
  if (kind === 'score') return HEALTH_SCORE_BANDS.find(({min}) => value >= min)!.className
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
