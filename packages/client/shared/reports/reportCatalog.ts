import {Providers} from '../../types/constEnums'

export const REPORT_TIME_DIMENSIONS = ['TIME', 'DAY', 'WEEK', 'MONTH'] as const
export type ReportTimeDimension = (typeof REPORT_TIME_DIMENSIONS)[number]

export const REPORT_CATEGORY_DIMENSIONS = [
  'TEAM',
  'MEETING_TYPE',
  'TASK_STATUS',
  'DONE_OR_OPEN',
  'INTEGRATION'
] as const
export type ReportCategoryDimension = (typeof REPORT_CATEGORY_DIMENSIONS)[number]
export type ReportDimension = ReportTimeDimension | ReportCategoryDimension

export type ReportMeasure =
  | 'ACTIVE_PEOPLE'
  | 'MEMBERS'
  | 'MEETINGS'
  | 'TEAMS_THAT_MET'
  | 'LAST_MEETING'
  | 'DISCUSSIONS'
  | 'DISCUSSIONS_WITH_A_TASK'
  | 'NEW_TASKS'
  | 'DONE_TASKS'
  | 'OPEN_TASKS'
  | 'USER_INTEGRATIONS'
  | 'TASKS_PUSHED'

export type ReportView = 'NUMBER' | 'LINE' | 'BARS' | 'HEATMAP' | 'TABLE'
export const REPORT_CONDITION_OPERATORS = [
  'AT_LEAST',
  'AT_MOST',
  'EQUALS',
  'OLDER_THAN_DAYS',
  'WITHIN_DAYS'
] as const
export type ReportConditionOperator = (typeof REPORT_CONDITION_OPERATORS)[number]
export const REPORT_PERIOD_PRESETS = [
  'PAGE',
  'LAST_7_DAYS',
  'LAST_30_DAYS',
  'LAST_3_MONTHS',
  'LAST_6_MONTHS',
  'LAST_12_MONTHS',
  'ALL_TIME'
] as const
export type ReportPeriodPreset = (typeof REPORT_PERIOD_PRESETS)[number]
export const REPORT_COMPARE_TO = ['PREVIOUS_PERIOD', 'A_WEEK_EARLIER', 'A_YEAR_EARLIER'] as const
export type ReportCompareTo = (typeof REPORT_COMPARE_TO)[number]
export const REPORT_SORT_BY = ['VALUE', 'NAME', 'TIME'] as const
export type ReportSortBy = (typeof REPORT_SORT_BY)[number]
export const REPORT_SORT_ORDERS = ['ASC', 'DESC'] as const
export type ReportSortOrder = (typeof REPORT_SORT_ORDERS)[number]

// count: adds up inside each step. distinct: each team once per step. reading: taken at the end of each step. latest: the most recent date
export type ReportMeasureKind = 'count' | 'distinct' | 'reading' | 'latest'

export interface ReportPeriod {
  preset?: ReportPeriodPreset | null
  startDate?: string | null
  endDate?: string | null
}

export interface ReportSpec {
  measures: ReportMeasure[]
  breakdown: {dimension: ReportDimension}[]
  filters: {dimension: ReportDimension; values: string[]}[]
  where: {measure: ReportMeasure; operator: ReportConditionOperator; value: number}[]
  period: ReportPeriod
  compareTo?: ReportCompareTo | null
  showAs: ReportView
  sort?: {by: ReportSortBy; order?: ReportSortOrder | null} | null
  limit?: number | null
}

interface ReportMeasureDefinition {
  kind: ReportMeasureKind
  label: string
  description: string
  dimensions: readonly ReportDimension[]
}

const OVER_TIME = REPORT_TIME_DIMENSIONS

export const REPORT_MEASURES = {
  ACTIVE_PEOPLE: {
    kind: 'reading',
    label: 'Active people',
    description: 'People who used Parabol in the 30 days before each point',
    dimensions: [...OVER_TIME, 'TEAM']
  },
  MEMBERS: {
    kind: 'reading',
    label: 'Members',
    description: 'People on the teams, or in the organization, at the end of each step',
    dimensions: [...OVER_TIME, 'TEAM']
  },
  MEETINGS: {
    kind: 'count',
    label: 'Meetings',
    description: 'Meetings that 2 or more people joined, by when they started',
    dimensions: [...OVER_TIME, 'TEAM', 'MEETING_TYPE']
  },
  TEAMS_THAT_MET: {
    kind: 'distinct',
    label: 'Teams that met',
    description: 'Teams of 2 or more that held a meeting 2 or more people joined',
    dimensions: [...OVER_TIME, 'MEETING_TYPE']
  },
  LAST_MEETING: {
    kind: 'latest',
    label: 'Last meeting',
    description: 'The date of the latest meeting in the period',
    dimensions: ['TEAM', 'MEETING_TYPE']
  },
  DISCUSSIONS: {
    kind: 'count',
    label: 'Discussions',
    description: 'Topics discussed in meetings',
    dimensions: [...OVER_TIME, 'TEAM', 'MEETING_TYPE']
  },
  DISCUSSIONS_WITH_A_TASK: {
    kind: 'count',
    label: 'Discussions with a task',
    description: 'Topics discussed in meetings that led to a task',
    dimensions: [...OVER_TIME, 'TEAM', 'MEETING_TYPE']
  },
  NEW_TASKS: {
    kind: 'count',
    label: 'New tasks',
    description: 'Tasks created, leaving out Sprint Poker stories brought in from an integration',
    dimensions: [...OVER_TIME, 'TEAM', 'MEETING_TYPE', 'TASK_STATUS', 'DONE_OR_OPEN', 'INTEGRATION']
  },
  DONE_TASKS: {
    kind: 'count',
    label: 'Done tasks',
    description: 'Tasks marked done, by when they were done',
    dimensions: [...OVER_TIME, 'TEAM', 'MEETING_TYPE', 'INTEGRATION']
  },
  OPEN_TASKS: {
    kind: 'reading',
    label: 'Open tasks',
    description: 'Tasks not done at the end of each step',
    dimensions: [...OVER_TIME, 'TEAM', 'MEETING_TYPE', 'TASK_STATUS', 'INTEGRATION']
  },
  USER_INTEGRATIONS: {
    kind: 'reading',
    label: 'User integrations',
    description: 'Integrations people connected, counting each person and service once',
    dimensions: [...OVER_TIME, 'TEAM', 'INTEGRATION']
  },
  TASKS_PUSHED: {
    kind: 'count',
    label: 'Tasks pushed to integrations',
    description:
      'Tasks pushed to an integration, including Sprint Poker stories brought in from one',
    dimensions: [...OVER_TIME, 'TEAM', 'MEETING_TYPE', 'INTEGRATION']
  }
} as const satisfies Record<ReportMeasure, ReportMeasureDefinition>

interface ReportViewRule {
  measures: readonly [min: number, max: number]
  breakdown: readonly [min: number, max: number]
  firstIsTime?: boolean
}

export const REPORT_VIEWS = {
  NUMBER: {measures: [1, 1], breakdown: [0, 0]},
  LINE: {measures: [1, 1], breakdown: [1, 2], firstIsTime: true},
  BARS: {measures: [1, 1], breakdown: [1, 2]},
  HEATMAP: {measures: [1, 1], breakdown: [2, 3]},
  TABLE: {measures: [1, 6], breakdown: [0, 3]}
} as const satisfies Record<ReportView, ReportViewRule>

export const MAX_REPORT_SERIES = 6
export const MAX_REPORT_LIMIT = 50
export const MAX_REPORT_FILTER_VALUES = 100
export const MAX_REPORT_CONDITION_DAYS = 3650

export const REPORT_MEETING_TYPES = {
  retrospective: 'Retrospective',
  teamPrompt: 'Standup',
  action: 'Check-in',
  poker: 'Sprint Poker',
  teamHealth: 'Team Health'
} as const
export const REPORT_NO_MEETING = 'none'
export const REPORT_NO_INTEGRATION = 'none'
export const REPORT_TASK_STATUSES = {
  active: 'Active',
  stuck: 'Stuck',
  future: 'Future',
  done: 'Done'
} as const
export const REPORT_DONE_OR_OPEN = {done: 'Done', open: 'Open'} as const
export const REPORT_INTEGRATION_LABELS: Record<string, string> = {
  jira: Providers.JIRA_CLOUD_NAME,
  jiraServer: Providers.JIRA_SERVER_NAME,
  github: Providers.GITHUB_NAME,
  gitlab: Providers.GITLAB_NAME,
  azureDevOps: Providers.AZUREDEVOPS_NAME,
  linear: Providers.LINEAR_NAME,
  mattermost: Providers.MATTERMOST_NAME,
  msTeams: Providers.MSTEAMS_NAME,
  slack: Providers.SLACK_NAME,
  gcal: Providers.GCAL_NAME,
  gmeet: 'Google Meet',
  gdrive: 'Google Drive',
  zoom: 'Zoom'
}

export const REPORT_VALUE_LABELS: Partial<Record<ReportCategoryDimension, Record<string, string>>> =
  {
    MEETING_TYPE: {...REPORT_MEETING_TYPES, [REPORT_NO_MEETING]: 'Outside meetings'},
    TASK_STATUS: REPORT_TASK_STATUSES,
    DONE_OR_OPEN: REPORT_DONE_OR_OPEN,
    INTEGRATION: {...REPORT_INTEGRATION_LABELS, [REPORT_NO_INTEGRATION]: 'None'}
  }

export const REPORT_DIMENSION_LABELS: Record<ReportDimension, string> = {
  TIME: 'Time',
  DAY: 'Day',
  WEEK: 'Week',
  MONTH: 'Month',
  TEAM: 'Team',
  MEETING_TYPE: 'Meeting type',
  TASK_STATUS: 'Task status',
  DONE_OR_OPEN: 'Done or open',
  INTEGRATION: 'Integration'
}

export const isReportTimeDimension = (
  dimension: ReportDimension
): dimension is ReportTimeDimension =>
  (REPORT_TIME_DIMENSIONS as readonly ReportDimension[]).includes(dimension)
