import dayjs from 'dayjs'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import type {ReportRowTotal} from './reportHeatmapGrid'
import type {ReportResultRow} from './reportRows'
import {SAMPLE_MONTHS} from './reportSampleMonths'

// A made-up organization's retrospective cadence over the last 3 months, shown faded behind the prompt to run a first
// retro: some teams keep a steady rhythm, some slip, one has stopped
const TEAMS = [
  {id: 'platform', name: 'Platform', retrosByMonth: [2, 2, 2], lastHeldDaysAgo: 4},
  {id: 'mobile', name: 'Mobile', retrosByMonth: [2, 2, 1], lastHeldDaysAgo: 9},
  {id: 'design', name: 'Design', retrosByMonth: [1, 1, 1], lastHeldDaysAgo: 12},
  {id: 'data', name: 'Data', retrosByMonth: [2, 1, 0], lastHeldDaysAgo: 34},
  {id: 'support', name: 'Support', retrosByMonth: [1, 0, 1], lastHeldDaysAgo: 6},
  {id: 'growth', name: 'Growth', retrosByMonth: [1, 0, 0], lastHeldDaysAgo: 71}
]

export const SAMPLE_RETRO_CADENCE_SPEC: ReportSpec = {
  measures: ['MEETINGS'],
  breakdown: [{dimension: 'TEAM'}, {dimension: 'MONTH'}],
  filters: [{dimension: 'MEETING_TYPE', values: ['retrospective']}],
  where: [],
  showAs: 'HEATMAP',
  sort: {by: 'VALUE', order: 'DESC'}
}

export const SAMPLE_RETRO_CADENCE_ROWS: ReportResultRow[] = TEAMS.flatMap((team) =>
  SAMPLE_MONTHS.map((month, idx) => ({
    keys: [{value: team.id, label: team.name, isPartial: false}, month],
    values: [team.retrosByMonth[idx]!],
    previousValues: null
  }))
)

export const SAMPLE_RETRO_CADENCE_ROW_TOTALS: ReportRowTotal[] = TEAMS.map((team) => ({
  keys: [{value: team.id}],
  values: [team.retrosByMonth.reduce((sum, count) => sum + count, 0)],
  previousValues: null
}))

export const SAMPLE_RETRO_CADENCE_LAST_HELD = new Map(
  TEAMS.map((team) => [team.id, dayjs().subtract(team.lastHeldDaysAgo, 'day').valueOf()])
)
