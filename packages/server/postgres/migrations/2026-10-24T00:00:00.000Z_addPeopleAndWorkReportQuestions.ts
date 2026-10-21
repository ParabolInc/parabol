import type {Kysely} from 'kysely'

const QUESTIONS = [
  {
    key: 'activeShareByTeam',
    subject: 'people',
    title: 'Active share by team',
    question: 'Which teams have the lowest adoption?',
    description: 'The percentage of each team’s members active in the last 30 days',
    spec: {
      measures: ['ACTIVE_SHARE'],
      breakdown: [{dimension: 'TEAM'}],
      period: {preset: 'LAST_30_DAYS'},
      showAs: 'BARS',
      sort: {by: 'VALUE', order: 'ASC'}
    },
    sortOrder: 23
  },
  {
    key: 'peopleNotSeen30Days',
    subject: 'people',
    title: 'People by last seen',
    question: 'Who hasn’t been seen in 30 days?',
    description: 'Members who haven’t used Parabol in 30 days',
    spec: {
      measures: ['LAST_SEEN'],
      breakdown: [{dimension: 'PERSON'}],
      where: [{measure: 'LAST_SEEN', operator: 'OLDER_THAN_DAYS', value: 30}],
      period: {preset: 'ALL_TIME'},
      showAs: 'TABLE',
      sort: {by: 'VALUE', order: 'ASC'}
    },
    sortOrder: 26
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
      period: {preset: 'PAGE'},
      showAs: 'BARS',
      sort: {by: 'VALUE', order: 'DESC'}
    },
    sortOrder: 53
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
      showAs: 'BARS'
    },
    sortOrder: 56
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
      showAs: 'BARS',
      sort: {by: 'VALUE', order: 'DESC'},
      limit: 6
    },
    sortOrder: 58
  }
]

export async function up(db: Kysely<any>): Promise<void> {
  await db
    .insertInto('PopularReportQuestion')
    .values(QUESTIONS.map(({spec, ...question}) => ({...question, spec: JSON.stringify(spec)})))
    .onConflict((oc) => oc.column('key').doNothing())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db
    .deleteFrom('PopularReportQuestion')
    .where(
      'key',
      'in',
      QUESTIONS.map(({key}) => key)
    )
    .execute()
}
