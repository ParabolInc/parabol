import {
  isReportAdditiveMeasure,
  isReportTimeDimension,
  type ReportDimension,
  type ReportSpec
} from '../../shared/reports/reportCatalog'
import {validateReportSpec} from '../../shared/reports/validateReportSpec'

type ReportBreakdownItem = ReportSpec['breakdown'][number]

const isTimeItem = ({dimension}: ReportBreakdownItem) => isReportTimeDimension(dimension)

// A view gets the breakdowns it needs, changing as few as it can: a heatmap gains columns, by category for a Health
// score and by time otherwise, a line puts time first, and a number or bars drop what they can't show
const fitView = (spec: ReportSpec): ReportSpec => {
  if (validateReportSpec(spec) === null) return spec
  const {showAs, breakdown} = spec
  const measure = spec.measures[0]!
  const timeItems = breakdown.filter(isTimeItem)
  const otherItems = breakdown.filter((item) => !isTimeItem(item))
  if (showAs === 'NUMBER') return {...spec, breakdown: []}
  if (showAs === 'LINE') {
    return {...spec, breakdown: [timeItems[0] ?? {dimension: 'TIME'}, ...otherItems.slice(0, 1)]}
  }
  if (showAs === 'BARS') {
    return {...spec, breakdown: breakdown.slice(0, isReportAdditiveMeasure(measure) ? 2 : 1)}
  }
  if (showAs !== 'HEATMAP' || breakdown.length >= 2) return spec
  const hasCategory = breakdown.some(({dimension}) => dimension === 'CATEGORY')
  const columns: ReportBreakdownItem | null =
    measure === 'HEALTH_SCORE' && !hasCategory
      ? {dimension: 'CATEGORY'}
      : timeItems.length === 0
        ? {dimension: 'TIME'}
        : null
  if (!columns) return spec
  const rows: ReportBreakdownItem[] = breakdown.length > 0 ? breakdown : [{dimension: 'TEAM'}]
  return {...spec, breakdown: [...rows, columns]}
}

const HEALTH_HEATMAP_ORDER: Partial<Record<ReportDimension, number>> = {
  TEAM_LEVEL: 0,
  TEAM: 1,
  CATEGORY: 3
}

// A heatmap's time breakdown is its columns, and a Health score heatmap's categories are its columns otherwise, with
// team structure levels before the teams in them
export const orderHeatmap = (spec: ReportSpec): ReportSpec => {
  if (spec.showAs !== 'HEATMAP') return spec
  const isHealth = spec.measures[0] === 'HEALTH_SCORE'
  const rankOf = ({dimension}: ReportBreakdownItem) => {
    if (isReportTimeDimension(dimension)) return 4
    if (!isHealth) return 2
    return HEALTH_HEATMAP_ORDER[dimension] ?? 2
  }
  return {...spec, breakdown: [...spec.breakdown].sort((a, b) => rankOf(a) - rankOf(b))}
}

// An edit that would leave a spec Parabol can't run changes what else it must for the edit to land
const fitReportSpec = (spec: ReportSpec) => fitView(spec)

export default fitReportSpec
