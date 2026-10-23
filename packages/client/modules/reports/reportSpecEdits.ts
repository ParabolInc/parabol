import {
  isReportAdditiveMeasure,
  isReportTimeDimension,
  REPORT_CATEGORY_DIMENSIONS,
  REPORT_COMPARE_TO,
  REPORT_DIMENSION_LABELS,
  REPORT_MEASURE_KEYS,
  REPORT_MEASURES,
  REPORT_STRUCTURE_LABELS,
  REPORT_STRUCTURE_NOT_SET,
  REPORT_TIME_DIMENSIONS,
  REPORT_VALUE_LABELS,
  REPORT_VIEW_KEYS,
  type ReportDimension,
  type ReportMeasure,
  type ReportSpec
} from '../../shared/reports/reportCatalog'
import {toTeamHealthHeatmapSpec} from '../../shared/reports/teamHealthReportSpec'
import {
  isMeasureDimension,
  toReportDimensionKey,
  validateReportSpec
} from '../../shared/reports/validateReportSpec'
import fitReportSpec, {orderHeatmap} from './fitReportSpec'
import {REPORT_PAGE_PRESETS} from './reportPeriodParam'
import {
  REPORT_COMPARE_LABELS,
  REPORT_PERIOD_LABELS,
  REPORT_VIEW_LABELS,
  type ReportStructureLevel
} from './reportSpecLabels'

export interface ReportSpecEditOption {
  key: string
  label: string
  spec: ReportSpec
  isSelected: boolean
  isValid: boolean
}

export interface ReportTeam {
  id: string
  name: string
}

const DIMENSIONS: ReportDimension[] = [...REPORT_TIME_DIMENSIONS, ...REPORT_CATEGORY_DIMENSIONS]
const LIMITS = [5, 8, 10, 20, 50]

// An edit drops the settings it leaves without a purpose, like a sort by name once nothing has a name.
// It never drops a filter, which would quietly widen the report
const repair = (spec: ReportSpec): ReportSpec => {
  const hasTime = spec.breakdown.some(({dimension}) => isReportTimeDimension(dimension))
  const hasCategory = spec.breakdown.some(({dimension}) => !isReportTimeDimension(dimension))
  const hasDate = spec.measures.some((measure) => REPORT_MEASURES[measure].kind === 'latest')
  const {sort} = spec
  const isSortUsable =
    !!sort && !(sort.by === 'TIME' && !hasTime) && !(sort.by === 'NAME' && !hasCategory)
  return {
    ...spec,
    where: spec.where.filter(({measure}) => spec.measures.includes(measure)),
    compareTo: hasDate ? null : (spec.compareTo ?? null),
    sort: isSortUsable ? sort : null,
    limit: hasCategory ? (spec.limit ?? null) : null
  }
}

// An option that sets what repair would drop, like a sort, is checked as is, so it can't pass by undoing itself
const toOption = (
  key: string,
  label: string,
  spec: ReportSpec,
  isSelected: boolean,
  shouldRepair = true
): ReportSpecEditOption => {
  const nextSpec = shouldRepair ? repair(fitReportSpec(spec)) : spec
  return {
    key,
    label,
    spec: nextSpec,
    isSelected,
    isValid: isSelected || validateReportSpec(nextSpec) === null
  }
}

const validOnly = (options: ReportSpecEditOption[]) => options.filter(({isValid}) => isValid)

const toRemoval = (spec: ReportSpec) => {
  const repaired = repair(spec)
  return validateReportSpec(repaired) === null ? repaired : null
}

const dimensionLabel = (dimension: ReportDimension) =>
  dimension === 'TIME' ? 'Auto' : REPORT_DIMENSION_LABELS[dimension]

type ReportDimensionItem = ReportSpec['breakdown'][number]

// the dimensions a breakdown or filter can pick, where team structure is one choice per level
const toChoices = (
  dimensions: readonly ReportDimension[],
  levels: readonly ReportStructureLevel[]
) =>
  dimensions.flatMap((dimension) =>
    dimension === 'TEAM_LEVEL'
      ? levels.map(({id, name}) => {
          const item: ReportDimensionItem = {dimension, levelId: id}
          return {key: toReportDimensionKey(item), label: name, item}
        })
      : [{key: dimension, label: dimensionLabel(dimension), item: {dimension}}]
  )

// A new measure keeps the breakdowns it can split by. Health score opens the Team Health heatmap
const withMeasure = (spec: ReportSpec, measure: ReportMeasure): ReportSpec => {
  if (measure === 'HEALTH_SCORE' && spec.measures[0] !== 'HEALTH_SCORE') {
    return toTeamHealthHeatmapSpec(spec)
  }
  return {
    ...spec,
    measures: [measure],
    breakdown: spec.breakdown.filter(({dimension}) => isMeasureDimension(measure, dimension))
  }
}

export const measureEdits = (spec: ReportSpec) => {
  const isMulti = spec.showAs === 'TABLE'
  const options = REPORT_MEASURE_KEYS.map((measure) => {
    const isSelected = spec.measures.includes(measure)
    const measures = isSelected
      ? spec.measures.filter((selected) => selected !== measure)
      : [...spec.measures, measure]
    const nextSpec = isMulti ? {...spec, measures} : withMeasure(spec, measure)
    return toOption(measure, REPORT_MEASURES[measure].label, nextSpec, isSelected)
  })
  return {options, isMulti}
}

export const breakdownEdits = (
  spec: ReportSpec,
  position: number,
  levels: readonly ReportStructureLevel[]
) => {
  const currentKey = toReportDimensionKey(spec.breakdown[position]!)
  const options = toChoices(DIMENSIONS, levels).map(({key, label, item}) => {
    const breakdown = spec.breakdown.map((current, idx) => (idx === position ? item : current))
    return toOption(key, label, {...spec, breakdown}, key === currentKey)
  })
  const removal = toRemoval({
    ...spec,
    breakdown: spec.breakdown.filter((_, idx) => idx !== position)
  })
  return {options, removal}
}

// A heatmap's new breakdown is another row, before its columns. Bars that can't stack a second breakdown become a
// heatmap, with categories as the columns of a Health score
const withBreakdownAdded = (spec: ReportSpec, item: ReportDimensionItem): ReportSpec => {
  const {showAs, measures, breakdown} = spec
  if (showAs === 'HEATMAP') {
    return {...spec, breakdown: [...breakdown.slice(0, -1), item, ...breakdown.slice(-1)]}
  }
  const added = [...breakdown, item]
  if (showAs !== 'BARS' || measures.every(isReportAdditiveMeasure)) {
    return {...spec, breakdown: added}
  }
  const needsCategory =
    measures[0] === 'HEALTH_SCORE' &&
    added.length < 3 &&
    !added.some(({dimension}) => dimension === 'CATEGORY')
  return {
    ...spec,
    showAs: 'HEATMAP',
    breakdown: needsCategory ? [...added, {dimension: 'CATEGORY'}] : added
  }
}

export const addBreakdownEdits = (spec: ReportSpec, levels: readonly ReportStructureLevel[]) =>
  validOnly(
    toChoices(DIMENSIONS, levels)
      .filter(({key}) => !spec.breakdown.some((item) => toReportDimensionKey(item) === key))
      .map(({key, label, item}) =>
        toOption(key, label, orderHeatmap(withBreakdownAdded(spec, item)), false)
      )
  )

const valuesOf = (
  {dimension, levelId}: ReportDimensionItem,
  teams: readonly ReportTeam[],
  levels: readonly ReportStructureLevel[]
) => {
  if (isReportTimeDimension(dimension)) return []
  if (dimension === 'TEAM') return teams.map(({id, name}) => ({value: id, label: name}))
  if (dimension === 'TEAM_LEVEL') {
    const level = levels.find(({id}) => id === levelId)
    if (!level) return []
    return [
      ...level.values.map(({id, name}) => ({value: id, label: name})),
      {value: REPORT_STRUCTURE_NOT_SET, label: REPORT_STRUCTURE_LABELS.notSet}
    ]
  }
  return Object.entries(REPORT_VALUE_LABELS[dimension] ?? {}).map(([value, label]) => ({
    value,
    label
  }))
}

export const filterEdits = (
  spec: ReportSpec,
  index: number,
  teams: readonly ReportTeam[],
  levels: readonly ReportStructureLevel[]
) => {
  const filter = spec.filters[index]!
  const withoutFilter = spec.filters.filter((_, idx) => idx !== index)
  const options = valuesOf(filter, teams, levels).map(({value, label}) => {
    const isSelected = filter.values.includes(value)
    const values = isSelected
      ? filter.values.filter((selected) => selected !== value)
      : [...filter.values, value]
    const filters =
      values.length === 0
        ? withoutFilter
        : spec.filters.map((item, idx) => (idx === index ? {...item, values} : item))
    return toOption(value, label, {...spec, filters}, isSelected)
  })
  return {options, removal: toRemoval({...spec, filters: withoutFilter})}
}

export const addFilterEdits = (
  spec: ReportSpec,
  teams: readonly ReportTeam[],
  levels: readonly ReportStructureLevel[]
) =>
  toChoices(REPORT_CATEGORY_DIMENSIONS, levels)
    .filter(({key}) => !spec.filters.some((filter) => toReportDimensionKey(filter) === key))
    .map(({key, label, item}) => ({
      key,
      label,
      options: validOnly(
        valuesOf(item, teams, levels).map((value) =>
          toOption(
            value.value,
            value.label,
            {...spec, filters: [...spec.filters, {...item, values: [value.value]}]},
            false
          )
        )
      )
    }))
    .filter(({options}) => options.length > 0)

export const whereRemoval = (spec: ReportSpec, index: number) =>
  toRemoval({...spec, where: spec.where.filter((_, idx) => idx !== index)})

export const periodEdits = (spec: ReportSpec) =>
  (['PAGE', ...REPORT_PAGE_PRESETS] as const).map((preset) =>
    toOption(
      preset,
      REPORT_PERIOD_LABELS[preset],
      {...spec, period: {preset, startDate: null, endDate: null}},
      spec.period.preset === preset
    )
  )

export const compareEdits = (spec: ReportSpec) =>
  validOnly(
    [null, ...REPORT_COMPARE_TO].map((compareTo) =>
      toOption(
        compareTo ?? 'NONE',
        compareTo ? REPORT_COMPARE_LABELS[compareTo] : 'Nothing',
        {...spec, compareTo},
        (spec.compareTo ?? null) === compareTo,
        false
      )
    )
  )

export const viewEdits = (spec: ReportSpec) =>
  REPORT_VIEW_KEYS.map((showAs) => {
    const isSelected = spec.showAs === showAs
    const viewSpec = isSelected ? spec : orderHeatmap(fitReportSpec({...spec, showAs}))
    return toOption(showAs, REPORT_VIEW_LABELS[showAs], viewSpec, isSelected)
  })

export const sortEdits = (spec: ReportSpec) => {
  const isDate = REPORT_MEASURES[spec.measures[0]!].kind === 'latest'
  const sorts = [
    {key: 'DEFAULT', label: 'Default', sort: null},
    {
      key: 'VALUE_DESC',
      label: isDate ? 'Newest first' : 'Largest first',
      sort: {by: 'VALUE', order: 'DESC'}
    },
    {
      key: 'VALUE_ASC',
      label: isDate ? 'Oldest first' : 'Smallest first',
      sort: {by: 'VALUE', order: 'ASC'}
    },
    {key: 'NAME_ASC', label: 'A to Z', sort: {by: 'NAME', order: 'ASC'}},
    {key: 'NAME_DESC', label: 'Z to A', sort: {by: 'NAME', order: 'DESC'}},
    {key: 'TIME_ASC', label: 'Oldest first', sort: {by: 'TIME', order: 'ASC'}},
    {key: 'TIME_DESC', label: 'Newest first', sort: {by: 'TIME', order: 'DESC'}}
  ] as const
  const current = spec.sort
    ? `${spec.sort.by}_${spec.sort.order ?? (spec.sort.by === 'VALUE' ? 'DESC' : 'ASC')}`
    : 'DEFAULT'
  return validOnly(
    sorts.map(({key, label, sort}) => toOption(key, label, {...spec, sort}, key === current, false))
  )
}

export const limitEdits = (spec: ReportSpec) =>
  validOnly(
    [null, ...LIMITS].map((limit) =>
      toOption(
        String(limit ?? 'NONE'),
        limit ? String(limit) : 'None',
        {...spec, limit},
        (spec.limit ?? null) === limit,
        false
      )
    )
  )
