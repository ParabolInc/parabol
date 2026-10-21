import type {Kysely} from 'kysely'

const QUESTIONS = [
  {
    key: 'whereTasksEndUp',
    subject: 'impact',
    title: 'Where new tasks end up',
    question: 'Where do our tasks end up?',
    description: 'New tasks by the meeting they came from, then their status now',
    spec: {
      measures: ['NEW_TASKS'],
      breakdown: [{dimension: 'MEETING_TYPE'}, {dimension: 'TASK_STATUS'}],
      period: {preset: 'PAGE'},
      showAs: 'FLOW'
    },
    sortOrder: 52
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
      period: {preset: 'PAGE'},
      compareTo: 'PREVIOUS_CHECK',
      showAs: 'HEATMAP'
    },
    sortOrder: 62
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
      showAs: 'BARS'
    },
    sortOrder: 64
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
