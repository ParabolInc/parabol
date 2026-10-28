import type {ReportSpec} from './reportCatalog'

export const POPULAR_REPORT_SUBJECTS = ['users', 'impact', 'teamHealth', 'teams'] as const
export type PopularReportSubject = (typeof POPULAR_REPORT_SUBJECTS)[number]

// A key names a question on every instance and in the built-in pins an org copied, so retire a question by
// deleting it and never give its key to another one
export interface PopularReportQuestion {
  key: string
  subject: PopularReportSubject
  title: string
  question: string
  description: string
  spec: ReportSpec
  // where it sits among the pins an org starts with, or missing when it isn't one
  defaultPinSortOrder?: number
}

export const POPULAR_REPORT_QUESTIONS: readonly PopularReportQuestion[] = [
  {
    key: 'activeUsersOverTime',
    subject: 'users',
    title: 'Active users over time',
    question: 'How many people are active, and how is that changing?',
    description: 'Each point counts the people active in the 30 days before it',
    spec: {
      measures: ['ACTIVE_USERS'],
      breakdown: [{dimension: 'TIME'}],
      filters: [],
      where: [],
      showAs: 'LINE'
    },
    defaultPinSortOrder: 1
  },
  {
    key: 'activeUsersByTeam',
    subject: 'users',
    title: 'Active users by team',
    question: 'Which teams have the most active members?',
    description: 'People active in the last 30 days, by team',
    spec: {
      measures: ['ACTIVE_USERS'],
      breakdown: [{dimension: 'TEAM'}],
      period: {preset: 'LAST_30_DAYS'},
      filters: [],
      where: [],
      showAs: 'BARS',
      sort: {by: 'VALUE', order: 'DESC'},
      limit: 8
    }
  },
  {
    key: 'activeShareByTeam',
    subject: 'users',
    title: 'Active share by team',
    question: 'Which teams have the lowest adoption?',
    description: 'The percentage of each team’s members active in the last 30 days',
    spec: {
      measures: ['ACTIVE_SHARE'],
      breakdown: [{dimension: 'TEAM'}],
      period: {preset: 'LAST_30_DAYS'},
      filters: [],
      where: [],
      showAs: 'BARS',
      sort: {by: 'VALUE', order: 'ASC'}
    }
  },
  {
    key: 'usersNotSeen30Days',
    subject: 'users',
    title: 'People by last seen',
    question: 'Who hasn’t been seen in 30 days?',
    description: 'Members who haven’t used Parabol in 30 days',
    spec: {
      measures: ['LAST_SEEN'],
      breakdown: [{dimension: 'USER'}],
      where: [{measure: 'LAST_SEEN', operator: 'OLDER_THAN_DAYS', value: 30}],
      period: {preset: 'ALL_TIME'},
      filters: [],
      showAs: 'TABLE',
      sort: {by: 'VALUE', order: 'ASC'}
    }
  },
  {
    key: 'meetingsByType',
    subject: 'users',
    title: 'Meetings by type',
    question: 'How many meetings did we run each month?',
    description: 'Meetings 2 or more people joined, by type, month by month',
    spec: {
      measures: ['MEETINGS'],
      breakdown: [{dimension: 'MONTH'}, {dimension: 'MEETING_TYPE'}],
      filters: [],
      where: [],
      showAs: 'BARS'
    },
    defaultPinSortOrder: 2
  },
  {
    key: 'meetingOutcomes',
    subject: 'impact',
    title: 'Discussions and tasks by meeting type',
    question: 'What do our meetings turn into?',
    description: 'What discussions turned into',
    spec: {
      measures: ['DISCUSSIONS', 'DISCUSSIONS_WITH_A_TASK', 'NEW_TASKS', 'DONE_TASKS'],
      breakdown: [{dimension: 'MEETING_TYPE'}],
      filters: [],
      where: [],
      showAs: 'TABLE'
    },
    defaultPinSortOrder: 3
  },
  {
    key: 'retroTasksDoneOrOpen',
    subject: 'impact',
    title: 'New tasks, done or open',
    question: 'Are tasks from retros getting done?',
    description: 'Tasks from retrospectives by team, done or still open',
    spec: {
      measures: ['NEW_TASKS'],
      breakdown: [{dimension: 'TEAM'}, {dimension: 'DONE_OR_OPEN'}],
      filters: [{dimension: 'MEETING_TYPE', values: ['retrospective']}],
      where: [],
      showAs: 'BARS',
      sort: {by: 'VALUE', order: 'DESC'}
    }
  },
  {
    key: 'whereTasksEndUp',
    subject: 'impact',
    title: 'Where new tasks end up',
    question: 'Where do our tasks end up?',
    description: 'New tasks by the meeting they came from, then their status now',
    spec: {
      measures: ['NEW_TASKS'],
      breakdown: [{dimension: 'MEETING_TYPE'}, {dimension: 'TASK_STATUS'}],
      filters: [],
      where: [],
      showAs: 'FLOW'
    }
  },
  {
    key: 'retroDaysToDone',
    subject: 'impact',
    title: 'Days to done for retro tasks',
    question: 'How long do retro tasks take to get done?',
    description: 'The median days from making a retro task to finishing it, by team',
    spec: {
      measures: ['DAYS_TO_DONE'],
      breakdown: [{dimension: 'TEAM'}],
      filters: [{dimension: 'MEETING_TYPE', values: ['retrospective']}],
      where: [],
      showAs: 'BARS',
      sort: {by: 'VALUE', order: 'DESC'}
    }
  },
  {
    key: 'openTasksByAge',
    subject: 'impact',
    title: 'Open tasks by age',
    question: 'How old are our open tasks?',
    description: 'Tasks not done yet, by how long ago they were made',
    spec: {
      measures: ['OPEN_TASKS'],
      breakdown: [{dimension: 'TASK_AGE'}],
      period: {preset: 'ALL_TIME'},
      filters: [],
      where: [],
      showAs: 'BARS'
    }
  },
  {
    key: 'newTasksByTopic',
    subject: 'impact',
    title: 'New tasks by topic',
    question: 'Which discussion topics lead to tasks?',
    description: 'The topics behind the most new tasks on your own teams',
    spec: {
      measures: ['NEW_TASKS'],
      breakdown: [{dimension: 'TOPIC'}],
      period: {preset: 'LAST_12_MONTHS'},
      filters: [],
      where: [],
      showAs: 'BARS',
      sort: {by: 'VALUE', order: 'DESC'},
      limit: 6
    }
  },
  {
    key: 'lastTeamHealthCheck',
    subject: 'teamHealth',
    title: 'Last Team Health check',
    question: 'Which teams aren’t checking in?',
    description: 'Teams without a Team Health check in 90 days',
    spec: {
      measures: ['LAST_MEETING'],
      breakdown: [{dimension: 'TEAM'}],
      filters: [{dimension: 'MEETING_TYPE', values: ['teamHealth']}],
      where: [{measure: 'LAST_MEETING', operator: 'OLDER_THAN_DAYS', value: 90}],
      period: {preset: 'ALL_TIME'},
      showAs: 'TABLE',
      sort: {by: 'VALUE', order: 'ASC'}
    }
  },
  {
    key: 'healthByTeam',
    subject: 'teamHealth',
    title: 'Health score by team',
    question: 'How is each team feeling?',
    description: 'Each team’s latest Team Health check by category, against the check before it',
    spec: {
      measures: ['HEALTH_SCORE'],
      breakdown: [{dimension: 'TEAM'}, {dimension: 'CATEGORY'}],
      compareTo: 'PREVIOUS_CHECK',
      filters: [],
      where: [],
      showAs: 'HEATMAP'
    }
  },
  {
    key: 'healthByCategory',
    subject: 'teamHealth',
    title: 'Health score by category',
    question: 'Which categories are slipping?',
    description: 'Every team’s latest check by category, against the year before',
    spec: {
      measures: ['HEALTH_SCORE'],
      breakdown: [{dimension: 'CATEGORY'}],
      period: {preset: 'LAST_12_MONTHS'},
      compareTo: 'PREVIOUS_PERIOD',
      filters: [],
      where: [],
      showAs: 'BARS'
    }
  },
  {
    key: 'teamsNotMet30Days',
    subject: 'teams',
    title: 'Teams by last meeting',
    question: 'Which teams haven’t met in 30 days?',
    description: 'Teams whose last meeting was over 30 days ago',
    spec: {
      measures: ['LAST_MEETING'],
      breakdown: [{dimension: 'TEAM'}],
      where: [{measure: 'LAST_MEETING', operator: 'OLDER_THAN_DAYS', value: 30}],
      period: {preset: 'ALL_TIME'},
      filters: [],
      showAs: 'TABLE',
      sort: {by: 'VALUE', order: 'ASC'}
    }
  },
  {
    key: 'meetingTypesByTeam',
    subject: 'teams',
    title: 'Meeting types by team',
    question: 'Which meeting types does each team run?',
    description: 'Meetings by team and type',
    spec: {
      measures: ['MEETINGS'],
      breakdown: [{dimension: 'TEAM'}, {dimension: 'MEETING_TYPE'}],
      filters: [],
      where: [],
      showAs: 'HEATMAP',
      sort: {by: 'VALUE', order: 'DESC'}
    }
  },
  {
    key: 'retroCadence',
    subject: 'teams',
    title: 'Retrospective cadence',
    question: 'Which teams keep up their monthly retros?',
    description: 'Retrospectives by team, month by month',
    spec: {
      measures: ['MEETINGS'],
      breakdown: [{dimension: 'TEAM'}, {dimension: 'MONTH'}],
      filters: [{dimension: 'MEETING_TYPE', values: ['retrospective']}],
      where: [],
      showAs: 'HEATMAP',
      sort: {by: 'VALUE', order: 'DESC'}
    },
    defaultPinSortOrder: 4
  }
]
