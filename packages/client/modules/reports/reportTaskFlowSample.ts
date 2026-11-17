import {
  REPORT_DIMENSION_LABELS,
  REPORT_NO_MEETING,
  REPORT_TASK_STATUSES,
  REPORT_VALUE_LABELS,
  type ReportSpec
} from '../../shared/reports/reportCatalog'
import type {ReportResultRow} from './reportRows'

// A made-up organization's new tasks from the last 3 months, shown faded behind the prompt to add a first one: most
// come from retros and get done, some stall, and a few are made outside any meeting
const TASKS_BY_MEETING_TYPE = [
  {meetingType: 'retrospective', done: 48, active: 14, stuck: 6, future: 10},
  {meetingType: 'action', done: 30, active: 9, stuck: 3, future: 4},
  {meetingType: REPORT_NO_MEETING, done: 9, active: 7, stuck: 2, future: 8},
  {meetingType: 'teamPrompt', done: 12, active: 6, stuck: 4, future: 2}
] as const

const STATUSES = ['done', 'active', 'stuck', 'future'] as const

export const SAMPLE_TASK_FLOW_SPEC: ReportSpec = {
  measures: ['NEW_TASKS'],
  breakdown: [{dimension: 'MEETING_TYPE'}, {dimension: 'TASK_STATUS'}],
  filters: [],
  where: [],
  showAs: 'FLOW'
}

export const SAMPLE_TASK_FLOW_BREAKDOWN_NAMES = [
  REPORT_DIMENSION_LABELS.MEETING_TYPE,
  REPORT_DIMENSION_LABELS.TASK_STATUS
]

export const SAMPLE_TASK_FLOW_ROWS: ReportResultRow[] = TASKS_BY_MEETING_TYPE.flatMap((tasks) =>
  STATUSES.map((status) => ({
    keys: [
      {
        value: tasks.meetingType,
        label: REPORT_VALUE_LABELS.MEETING_TYPE![tasks.meetingType]!,
        isPartial: false
      },
      {value: status, label: REPORT_TASK_STATUSES[status], isPartial: false}
    ],
    values: [tasks[status]],
    previousValues: null
  }))
)
