import {Providers} from '../../types/constEnums'

export const REPORT_TIME_DIMENSIONS = ['TIME', 'DAY', 'WEEK', 'MONTH'] as const
export type ReportTimeDimension = (typeof REPORT_TIME_DIMENSIONS)[number]

export const REPORT_CATEGORY_DIMENSIONS = [
  'TEAM',
  'TEAM_LEVEL',
  'USER',
  'MEETING_TYPE',
  'TEMPLATE',
  'TASK_STATUS',
  'DONE_OR_OPEN',
  'TASK_AGE',
  'TOPIC',
  'INTEGRATION',
  'CATEGORY'
] as const
export type ReportCategoryDimension = (typeof REPORT_CATEGORY_DIMENSIONS)[number]
export type ReportDimension = ReportTimeDimension | ReportCategoryDimension

export const REPORT_MEASURE_KEYS = [
  'ACTIVE_USERS',
  'MEMBERS',
  'ACTIVE_SHARE',
  'LAST_SEEN',
  'MEETINGS',
  'TEAMS_THAT_MET',
  'LAST_MEETING',
  'DISCUSSIONS',
  'DISCUSSIONS_WITH_A_TASK',
  'NEW_TASKS',
  'DONE_TASKS',
  'OPEN_TASKS',
  'DAYS_TO_DONE',
  'USER_INTEGRATIONS',
  'TASKS_PUSHED',
  'HEALTH_SCORE'
] as const
export type ReportMeasure = (typeof REPORT_MEASURE_KEYS)[number]

export const REPORT_VIEW_KEYS = ['NUMBER', 'LINE', 'BARS', 'HEATMAP', 'FLOW', 'TABLE'] as const
export type ReportView = (typeof REPORT_VIEW_KEYS)[number]
export const REPORT_CONDITION_OPERATORS = [
  'AT_LEAST',
  'AT_MOST',
  'EQUALS',
  'OLDER_THAN_DAYS',
  'WITHIN_DAYS'
] as const
export type ReportConditionOperator = (typeof REPORT_CONDITION_OPERATORS)[number]
export const REPORT_PERIOD_PRESETS = [
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
export const SORT_DIRECTIONS = ['ASC', 'DESC'] as const
export type SortDirection = (typeof SORT_DIRECTIONS)[number]

// count: adds up inside each step. distinct: each team once per step. reading: taken at the end of each step.
// latest: the most recent date. share: a percentage taken at the end of each step. median: the middle value of
// what finished in each step. score: the average 1 to 5 answer in each team's latest Team Health check of each category.
// Shares, medians and scores never add up, so nothing totals or stacks them
export type ReportMeasureKind =
  | 'count'
  | 'distinct'
  | 'reading'
  | 'latest'
  | 'share'
  | 'median'
  | 'score'

// the first and last day, as YYYY-MM-DD in the report's time zone
export interface ReportDateRange {
  startAt: string
  endAt: string
}

export type ReportPeriod =
  | {preset: ReportPeriodPreset; range?: never}
  | {preset?: never; range: ReportDateRange}

export interface ReportSpec {
  measures: ReportMeasure[]
  // levelId names the org structure level a TEAM_LEVEL breakdown or filter uses
  breakdown: {dimension: ReportDimension; levelId?: string}[]
  filters: {dimension: ReportDimension; levelId?: string; values: string[]}[]
  where: {measure: ReportMeasure; operator: ReportConditionOperator; value: number}[]
  // null follows the period picked on the Reports page
  period?: ReportPeriod | null
  compareTo?: ReportCompareTo | null
  showAs: ReportView
  sort?: {by: ReportSortBy; order?: SortDirection | null} | null
  limit?: number | null
}

interface ReportMeasureDefinition {
  kind: ReportMeasureKind
  label: string
  description: string
  dimensions: readonly ReportDimension[]
  // breakdowns where one thing counts toward several values, like a meeting toward each person who joined
  countsInSeveral?: readonly ReportDimension[]
}

const OVER_TIME = REPORT_TIME_DIMENSIONS

export const REPORT_MEASURES = {
  ACTIVE_USERS: {
    kind: 'reading',
    label: 'Active users',
    description: 'People who used Parabol in the 30 days before each point',
    dimensions: [...OVER_TIME, 'TEAM', 'TEAM_LEVEL']
  },
  MEMBERS: {
    kind: 'reading',
    label: 'Members',
    description: 'People on the teams, or in the organization, at the end of each step',
    dimensions: [...OVER_TIME, 'TEAM', 'TEAM_LEVEL']
  },
  ACTIVE_SHARE: {
    kind: 'share',
    label: 'Active share',
    description: 'The percentage of members who used Parabol in the 30 days before each point',
    dimensions: [...OVER_TIME, 'TEAM', 'TEAM_LEVEL']
  },
  LAST_SEEN: {
    kind: 'latest',
    label: 'Last seen',
    description: 'When each person last used Parabol, whatever the period',
    dimensions: ['USER', 'TEAM', 'TEAM_LEVEL']
  },
  MEETINGS: {
    kind: 'count',
    label: 'Meetings',
    description:
      'Meetings that 2 or more people joined, by when they started. By person, the meetings each person joined',
    dimensions: [...OVER_TIME, 'TEAM', 'TEAM_LEVEL', 'USER', 'MEETING_TYPE', 'TEMPLATE'],
    countsInSeveral: ['USER']
  },
  TEAMS_THAT_MET: {
    kind: 'distinct',
    label: 'Teams that met',
    description: 'Teams of 2 or more that held a meeting 2 or more people joined',
    dimensions: [...OVER_TIME, 'TEAM_LEVEL', 'MEETING_TYPE']
  },
  LAST_MEETING: {
    kind: 'latest',
    label: 'Last meeting',
    description: 'The date of the latest meeting in the period',
    dimensions: ['TEAM', 'TEAM_LEVEL', 'MEETING_TYPE', 'TEMPLATE']
  },
  DISCUSSIONS: {
    kind: 'count',
    label: 'Discussions',
    description: 'Topics discussed in meetings',
    dimensions: [...OVER_TIME, 'TEAM', 'TEAM_LEVEL', 'MEETING_TYPE', 'TEMPLATE', 'TOPIC']
  },
  DISCUSSIONS_WITH_A_TASK: {
    kind: 'count',
    label: 'Discussions with a task',
    description: 'Topics discussed in meetings that led to a task',
    dimensions: [...OVER_TIME, 'TEAM', 'TEAM_LEVEL', 'MEETING_TYPE', 'TEMPLATE', 'TOPIC']
  },
  NEW_TASKS: {
    kind: 'count',
    label: 'New tasks',
    description: 'Tasks created, leaving out Sprint Poker stories brought in from an integration',
    dimensions: [
      ...OVER_TIME,
      'TEAM',
      'TEAM_LEVEL',
      'USER',
      'MEETING_TYPE',
      'TEMPLATE',
      'TASK_STATUS',
      'DONE_OR_OPEN',
      'TOPIC',
      'INTEGRATION'
    ]
  },
  DONE_TASKS: {
    kind: 'count',
    label: 'Done tasks',
    description: 'Tasks marked done, by when they were done',
    dimensions: [
      ...OVER_TIME,
      'TEAM',
      'TEAM_LEVEL',
      'USER',
      'MEETING_TYPE',
      'TEMPLATE',
      'TOPIC',
      'INTEGRATION'
    ]
  },
  OPEN_TASKS: {
    kind: 'reading',
    label: 'Open tasks',
    description: 'Tasks not done at the end of each step',
    dimensions: [
      ...OVER_TIME,
      'TEAM',
      'TEAM_LEVEL',
      'USER',
      'MEETING_TYPE',
      'TEMPLATE',
      'TASK_STATUS',
      'TASK_AGE',
      'TOPIC',
      'INTEGRATION'
    ]
  },
  DAYS_TO_DONE: {
    kind: 'median',
    label: 'Days to finish a task',
    description:
      'The median days from making a task to marking it done, among the tasks finished in each step',
    dimensions: [
      ...OVER_TIME,
      'TEAM',
      'TEAM_LEVEL',
      'USER',
      'MEETING_TYPE',
      'TEMPLATE',
      'TOPIC',
      'INTEGRATION'
    ]
  },
  USER_INTEGRATIONS: {
    kind: 'reading',
    label: 'User integrations',
    description: 'Integrations people connected, counting each person and service once',
    dimensions: [...OVER_TIME, 'TEAM', 'TEAM_LEVEL', 'INTEGRATION']
  },
  TASKS_PUSHED: {
    kind: 'count',
    label: 'Tasks pushed to integrations',
    description:
      'Tasks pushed to an integration, including Sprint Poker stories brought in from one',
    dimensions: [...OVER_TIME, 'TEAM', 'TEAM_LEVEL', 'MEETING_TYPE', 'INTEGRATION']
  },
  HEALTH_SCORE: {
    kind: 'score',
    label: 'Health score',
    description:
      'The average 1 to 5 answer in each team’s latest Team Health check that asked about each category, from the 90 days before each point or from the period. Compared with an earlier period, each team’s check comes from at least the 90 days before that period ended, and only the teams and categories this period has count. A check fewer than 3 people answered is hidden',
    dimensions: [...OVER_TIME, 'TEAM', 'TEAM_LEVEL', 'CATEGORY', 'TEMPLATE']
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
  FLOW: {measures: [1, 1], breakdown: [2, 3]},
  TABLE: {measures: [1, 6], breakdown: [0, 3]}
} as const satisfies Record<ReportView, ReportViewRule>

export const MAX_REPORT_SERIES = 6
export const MAX_REPORT_LIMIT = 50
export const MAX_REPORT_FILTER_VALUES = 100
export const MAX_REPORT_CONDITION_DAYS = 3650
// Reports hide a team's check until 3 people answered it, so an average can't be pinned on one or two of
// them. The meeting holds facts about single people, like the spread, to MIN_ANONYMOUS_RESPONDENTS
export const MIN_REPORT_HEALTH_RESPONDENTS = 3
// the value of a cell those too few people answered, which the client shows as hidden
export const REPORT_HIDDEN_VALUE = -1

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
// in age order, which a report keeps unless it's sorted another way
export const REPORT_TASK_AGES = {
  under30Days: 'Under 30 days',
  from30To90Days: '30 to 90 days',
  from90To180Days: '90 to 180 days',
  over180Days: 'Over 180 days'
} as const
export const REPORT_NO_USER = 'none'
// a team no one has placed at a value of an org structure level yet, and the one group a removed level lists
export const REPORT_STRUCTURE_NOT_SET = 'notSet'
export const REPORT_STRUCTURE_REMOVED = 'removed'
export const MAX_ORG_STRUCTURE_LEVELS = 5
export const MAX_ORG_STRUCTURE_VALUES = 100
export const MAX_ORG_STRUCTURE_NAME_LENGTH = 100
export const REPORT_STRUCTURE_LABELS = {
  [REPORT_STRUCTURE_NOT_SET]: 'Not set',
  [REPORT_STRUCTURE_REMOVED]: 'Removed level'
}
export const REPORT_NO_TEMPLATE = 'none'
export const REPORT_OTHER_TEAM_TEMPLATE = 'otherTeamTemplate'
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
    TASK_AGE: REPORT_TASK_AGES,
    INTEGRATION: {...REPORT_INTEGRATION_LABELS, [REPORT_NO_INTEGRATION]: 'None'}
  }

// Names for the fixed values of dimensions the report otherwise names, like people. They aren't every value, so
// unlike REPORT_VALUE_LABELS they're never offered as filters
export const REPORT_SPECIAL_VALUE_LABELS: Partial<
  Record<ReportCategoryDimension, Record<string, string>>
> = {
  USER: {[REPORT_NO_USER]: 'No one'},
  TEAM_LEVEL: REPORT_STRUCTURE_LABELS,
  TEMPLATE: {
    [REPORT_NO_TEMPLATE]: 'No template',
    [REPORT_OTHER_TEAM_TEMPLATE]: 'Another team’s template'
  }
}

export const REPORT_DIMENSION_LABELS: Record<ReportDimension, string> = {
  TIME: 'Time',
  DAY: 'Day',
  WEEK: 'Week',
  MONTH: 'Month',
  TEAM: 'Team',
  TEAM_LEVEL: 'Team structure',
  USER: 'Person',
  MEETING_TYPE: 'Meeting type',
  TEMPLATE: 'Template',
  TASK_STATUS: 'Task status',
  DONE_OR_OPEN: 'Done or open',
  TASK_AGE: 'Task age',
  TOPIC: 'Topic',
  INTEGRATION: 'Integration',
  CATEGORY: 'Category'
}

export const REPORT_LOWER_IS_BETTER: readonly ReportMeasure[] = ['DAYS_TO_DONE']

export const isReportAdditiveMeasure = (measure: ReportMeasure) => {
  const {kind} = REPORT_MEASURES[measure]
  return kind !== 'latest' && kind !== 'share' && kind !== 'median' && kind !== 'score'
}

export const isReportCountedOnceBy = (measure: ReportMeasure, dimension: ReportDimension) => {
  const definition: ReportMeasureDefinition = REPORT_MEASURES[measure]
  return !definition.countsInSeveral?.includes(dimension)
}

export const isReportTimeDimension = (
  dimension: ReportDimension
): dimension is ReportTimeDimension =>
  (REPORT_TIME_DIMENSIONS as readonly ReportDimension[]).includes(dimension)
