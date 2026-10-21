import {type Kysely, sql} from 'kysely'

// Later migrations add, fix or retire questions by key, which is how a new one reaches every instance
const QUESTIONS = [
  {
    key: 'activePeopleOverTime',
    subject: 'people',
    title: 'Active people over time',
    question: 'How many people are active, and how is that changing?',
    description: 'Each point counts the people active in the 30 days before it',
    spec: {
      measures: ['ACTIVE_PEOPLE'],
      breakdown: [{dimension: 'TIME'}],
      period: {preset: 'PAGE'},
      showAs: 'LINE'
    },
    defaultPinSortOrder: 1
  },
  {
    key: 'activePeopleByTeam',
    subject: 'people',
    title: 'Active people by team',
    question: 'Which teams have the most active members?',
    description: 'People active in the last 30 days, by team',
    spec: {
      measures: ['ACTIVE_PEOPLE'],
      breakdown: [{dimension: 'TEAM'}],
      period: {preset: 'LAST_30_DAYS'},
      showAs: 'BARS',
      sort: {by: 'VALUE', order: 'DESC'},
      limit: 8
    }
  },
  {
    key: 'meetingsByType',
    subject: 'people',
    title: 'Meetings by type',
    question: 'How many meetings did we run each month?',
    description: 'Meetings 2 or more people joined, by type, month by month',
    spec: {
      measures: ['MEETINGS'],
      breakdown: [{dimension: 'MONTH'}, {dimension: 'MEETING_TYPE'}],
      period: {preset: 'PAGE'},
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
      period: {preset: 'PAGE'},
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
      period: {preset: 'PAGE'},
      showAs: 'BARS',
      sort: {by: 'VALUE', order: 'DESC'}
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
      period: {preset: 'PAGE'},
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
      period: {preset: 'PAGE'},
      showAs: 'HEATMAP',
      sort: {by: 'VALUE', order: 'DESC'}
    },
    defaultPinSortOrder: 4
  }
]

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('PopularReportQuestion')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('key', 'varchar(100)', (col) => col.notNull().unique())
    .addColumn('subject', 'varchar(50)', (col) => col.notNull())
    .addColumn('title', 'varchar(255)', (col) => col.notNull())
    .addColumn('question', 'varchar(500)', (col) => col.notNull())
    .addColumn('description', 'varchar(500)', (col) => col.notNull())
    .addColumn('spec', 'jsonb', (col) => col.notNull())
    .addColumn('sortOrder', 'integer', (col) => col.notNull())
    .addColumn('defaultPinSortOrder', 'integer')
    .addColumn('retiredAt', 'timestamptz')
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()
  await db
    .insertInto('PopularReportQuestion')
    .values(
      QUESTIONS.map(({spec, defaultPinSortOrder, ...question}, idx) => ({
        ...question,
        spec: JSON.stringify(spec),
        sortOrder: (idx + 1) * 10,
        defaultPinSortOrder: defaultPinSortOrder ?? null
      }))
    )
    .onConflict((oc) => oc.column('key').doNothing())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('PopularReportQuestion').ifExists().execute()
}
