import {REPORT_MEETING_TYPES, type ReportSpec} from '../../shared/reports/reportCatalog'
import type {ReportResultRow} from './reportRows'
import {SAMPLE_MONTHS} from './reportSampleMonths'

// A made-up organization's meetings over the last 3 months, shown faded behind the prompt to run a first one:
// standups and retros most, and a Team Health check once a quarter
const MEETINGS_BY_TYPE = [
  {meetingType: 'teamPrompt', meetingsByMonth: [14, 15, 12]},
  {meetingType: 'retrospective', meetingsByMonth: [9, 10, 8]},
  {meetingType: 'action', meetingsByMonth: [6, 7, 5]},
  {meetingType: 'poker', meetingsByMonth: [4, 4, 3]},
  {meetingType: 'teamHealth', meetingsByMonth: [0, 3, 0]}
] as const

export const SAMPLE_MEETINGS_BY_TYPE_SPEC: ReportSpec = {
  measures: ['MEETINGS'],
  breakdown: [{dimension: 'MONTH'}, {dimension: 'MEETING_TYPE'}],
  filters: [],
  where: [],
  showAs: 'BARS'
}

export const SAMPLE_MEETINGS_BY_TYPE_ROWS: ReportResultRow[] = SAMPLE_MONTHS.flatMap((month, idx) =>
  MEETINGS_BY_TYPE.map(({meetingType, meetingsByMonth}) => ({
    keys: [month, {value: meetingType, label: REPORT_MEETING_TYPES[meetingType], isPartial: false}],
    values: [meetingsByMonth[idx]!],
    previousValues: null
  }))
)
