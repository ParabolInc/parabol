import {type Kysely, sql} from 'kysely'
import type {MigrationConfig} from 'kysely/migration'

const RECENT_QUESTION_LIMIT = 20

// Later migrations add, fix or retire questions by key, which is how a new one reaches every instance
const QUESTIONS = [
  {
    key: 'activePeopleOverTime',
    subject: 'people',
    title: 'Active users over time',
    question: 'How many people are active, and how is that changing?',
    description: 'Each point counts the people active in the 30 days before it',
    spec: {
      measures: ['ACTIVE_PEOPLE'],
      breakdown: [{dimension: 'TIME'}],
      period: {preset: 'PAGE'},
      showAs: 'LINE'
    },
    sortOrder: 10,
    defaultPinSortOrder: 1
  },
  {
    key: 'activePeopleByTeam',
    subject: 'people',
    title: 'Active users by team',
    question: 'Which teams have the most active members?',
    description: 'People active in the last 30 days, by team',
    spec: {
      measures: ['ACTIVE_PEOPLE'],
      breakdown: [{dimension: 'TEAM'}],
      period: {preset: 'LAST_30_DAYS'},
      showAs: 'BARS',
      sort: {by: 'VALUE', order: 'DESC'},
      limit: 8
    },
    sortOrder: 20
  },
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
    sortOrder: 30,
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
    sortOrder: 40,
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
    },
    sortOrder: 50
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
      period: {preset: 'PAGE'},
      showAs: 'FLOW'
    },
    sortOrder: 52
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
    },
    sortOrder: 60
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
    },
    sortOrder: 70
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
    },
    sortOrder: 80
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
    sortOrder: 90,
    defaultPinSortOrder: 4
  }
]

// CREATE INDEX CONCURRENTLY keeps Task and NewMeeting writable while the indexes build, and pg forbids it in a
// transaction, so this migration opts out of its own and wraps everything else in one. A build that fails leaves
// an invalid index behind, so each is dropped first and the migration can run again
export const config: MigrationConfig = {transaction: false}

const INDEXES = [
  {name: 'idx_NewMeeting_teamId_createdAt', table: 'NewMeeting', columns: ['teamId', 'createdAt']},
  {name: 'idx_Task_teamId_createdAt', table: 'Task', columns: ['teamId', 'createdAt']}
]

const createIndexConcurrently = async (
  db: Kysely<any>,
  {name, table, columns}: {name: string; table: string; columns: string[]}
) => {
  await sql`DROP INDEX CONCURRENTLY IF EXISTS ${sql.id(name)}`.execute(db)
  await sql`CREATE INDEX CONCURRENTLY ${sql.id(name)} ON ${sql.table(table)} (${sql.join(columns.map((column) => sql.id(column)))})`.execute(
    db
  )
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // a rerun after a failed index build finds the tables already committed
  const {rows} = await sql<{
    hasTables: boolean
  }>`SELECT to_regclass('"PinnedReport"') IS NOT NULL AS "hasTables"`.execute(db)
  if (!rows[0]?.hasTables) await createReportTables(db)
  for (const index of INDEXES) await createIndexConcurrently(db, index)
  // the new index leads with teamId, so it serves every lookup the teamId index did
  await sql`DROP INDEX CONCURRENTLY IF EXISTS "idx_NewMeeting_teamId"`.execute(db)
}

const createReportTables = async (db: Kysely<any>) => {
  await db.transaction().execute(async (trx) => {
    // No backfill: rewriting every done task would bump updatedAt through update_Task_updatedAt and reorder task lists
    await trx.schema.alterTable('Task').addColumn('doneAt', 'timestamptz').execute()
    await sql`
      CREATE OR REPLACE FUNCTION public."set_Task_doneAt"() RETURNS trigger
        LANGUAGE plpgsql
        AS $$
      BEGIN
        IF NEW."status" <> 'done' THEN
          NEW."doneAt" = NULL;
        ELSIF TG_OP = 'INSERT' OR OLD."status" <> 'done' THEN
          NEW."doneAt" = COALESCE(NEW."doneAt", now());
        END IF;
        RETURN NEW;
      END;
      $$;
    `.execute(trx)
    await sql`
      CREATE TRIGGER "set_Task_doneAt" BEFORE INSERT OR UPDATE OF "status" ON "Task"
        FOR EACH ROW EXECUTE FUNCTION public."set_Task_doneAt"()
    `.execute(trx)

    // pg allows adding enum values in a transaction as long as nothing here uses them
    await sql`ALTER TYPE "OAuthScopeEnum" ADD VALUE IF NOT EXISTS 'reports:read'`.execute(trx)
    await sql`ALTER TYPE "OAuthScopeEnum" ADD VALUE IF NOT EXISTS 'reports:write'`.execute(trx)

    await trx.schema
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
      .addColumn('createdAt', 'timestamptz', (col) =>
        col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
      )
      .execute()
    await trx
      .insertInto('PopularReportQuestion')
      .values(
        QUESTIONS.map(({spec, defaultPinSortOrder, ...question}) => ({
          ...question,
          spec: JSON.stringify(spec),
          defaultPinSortOrder: defaultPinSortOrder ?? null
        }))
      )
      .onConflict((oc) => oc.column('key').doNothing())
      .execute()

    await trx.schema
      .createType('ReportQuestionSourceEnum')
      .asEnum(['ask', 'popular', 'builder'])
      .execute()
    await trx.schema
      .createType('ReportQuestionOutcomeEnum')
      .asEnum(['shown', 'couldNotBuild'])
      .execute()
    await trx.schema
      .createTable('ReportQuestion')
      .ifNotExists()
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('userId', 'varchar(100)', (col) =>
        col.notNull().references('User.id').onDelete('cascade')
      )
      .addColumn('orgId', 'varchar(100)', (col) =>
        col.notNull().references('Organization.id').onDelete('cascade')
      )
      .addColumn('source', sql`"ReportQuestionSourceEnum"`, (col) => col.notNull())
      .addColumn('question', 'varchar(500)')
      .addColumn('title', 'varchar(255)', (col) => col.notNull())
      .addColumn('aiSpec', 'jsonb')
      .addColumn('spec', 'jsonb')
      .addColumn('outcome', sql`"ReportQuestionOutcomeEnum"`, (col) => col.notNull())
      .addColumn('popularQuestionId', 'integer', (col) =>
        col.references('PopularReportQuestion.id').onDelete('set null')
      )
      .addColumn('shape', 'varchar(1000)')
      .addColumn('dedupeKey', 'varchar(64)', (col) => col.notNull())
      .addColumn('uses', 'integer', (col) => col.notNull().defaultTo(1))
      .addColumn('createdAt', 'timestamptz', (col) =>
        col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
      )
      .addColumn('lastUsedAt', 'timestamptz', (col) =>
        col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
      )
      .addColumn('editedAt', 'timestamptz')
      .addUniqueConstraint('ReportQuestion_userId_orgId_dedupeKey', [
        'userId',
        'orgId',
        'dedupeKey'
      ])
      .execute()
    await trx.schema
      .createIndex('idx_ReportQuestion_userId_orgId_lastUsedAt')
      .ifNotExists()
      .on('ReportQuestion')
      .columns(['userId', 'orgId', 'lastUsedAt'])
      .execute()
    // each person keeps their newest questions in each org, so the table can't grow without limit
    await sql`
      CREATE OR REPLACE FUNCTION "trimReportQuestions"()
      RETURNS TRIGGER AS $$
      BEGIN
        DELETE FROM "ReportQuestion"
        WHERE "userId" = NEW."userId" AND "orgId" = NEW."orgId" AND id NOT IN (
          SELECT id FROM "ReportQuestion"
          WHERE "userId" = NEW."userId" AND "orgId" = NEW."orgId"
          ORDER BY "lastUsedAt" DESC, id DESC
          LIMIT ${sql.lit(RECENT_QUESTION_LIMIT)}
        );
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER "trimReportQuestions"
      AFTER INSERT ON "ReportQuestion"
      FOR EACH ROW EXECUTE FUNCTION "trimReportQuestions"();
    `.execute(trx)

    // Unpinned reports keep their row, so what people ask for can be compared with what they keep
    await trx.schema
      .createTable('PinnedReport')
      .ifNotExists()
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('orgId', 'varchar(100)', (col) =>
        col.notNull().references('Organization.id').onDelete('cascade')
      )
      .addColumn('isBuiltIn', 'boolean', (col) => col.notNull().defaultTo(false))
      .addColumn('createdBy', 'varchar(100)', (col) =>
        col.references('User.id').onDelete('set null')
      )
      .addColumn('source', sql`"ReportQuestionSourceEnum"`)
      .addColumn('question', 'varchar(500)')
      .addColumn('popularQuestionId', 'integer', (col) =>
        col.references('PopularReportQuestion.id').onDelete('set null')
      )
      .addColumn('title', 'varchar(255)', (col) => col.notNull())
      .addColumn('description', 'varchar(500)')
      .addColumn('spec', 'jsonb', (col) => col.notNull())
      .addColumn('shape', 'varchar(1000)', (col) => col.notNull())
      .addColumn('sortOrder', 'integer', (col) => col.notNull())
      .addColumn('createdAt', 'timestamptz', (col) =>
        col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
      )
      .addColumn('removedAt', 'timestamptz')
      .addColumn('removedBy', 'varchar(100)', (col) =>
        col.references('User.id').onDelete('set null')
      )
      .execute()
    await trx.schema
      .createIndex('idx_PinnedReport_orgId')
      .ifNotExists()
      .on('PinnedReport')
      .column('orgId')
      .execute()

    // The levels an org groups its teams by, widest first, like business unit, then department
    await trx.schema
      .createTable('OrgStructureLevel')
      .ifNotExists()
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('orgId', 'varchar(100)', (col) =>
        col.notNull().references('Organization.id').onDelete('cascade')
      )
      .addColumn('name', 'varchar(100)', (col) => col.notNull())
      .addColumn('sortOrder', 'integer', (col) => col.notNull())
      .addColumn('createdAt', 'timestamptz', (col) =>
        col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
      )
      .execute()
    await trx.schema
      .createIndex('idx_OrgStructureLevel_orgId')
      .ifNotExists()
      .on('OrgStructureLevel')
      .column('orgId')
      .execute()
    await trx.schema
      .createTable('OrgStructureValue')
      .ifNotExists()
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('levelId', 'integer', (col) =>
        col.notNull().references('OrgStructureLevel.id').onDelete('cascade')
      )
      .addColumn('name', 'varchar(100)', (col) => col.notNull())
      .addColumn('sortOrder', 'integer', (col) => col.notNull())
      .addColumn('createdAt', 'timestamptz', (col) =>
        col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
      )
      .execute()
    await trx.schema
      .createIndex('idx_OrgStructureValue_levelId')
      .ifNotExists()
      .on('OrgStructureValue')
      .column('levelId')
      .execute()
    // a team sits at one value of each level, or at none until someone places it
    await trx.schema
      .createTable('OrgStructurePlacement')
      .ifNotExists()
      .addColumn('teamId', 'varchar(100)', (col) =>
        col.notNull().references('Team.id').onDelete('cascade')
      )
      .addColumn('levelId', 'integer', (col) =>
        col.notNull().references('OrgStructureLevel.id').onDelete('cascade')
      )
      .addColumn('valueId', 'integer', (col) =>
        col.notNull().references('OrgStructureValue.id').onDelete('cascade')
      )
      .addPrimaryKeyConstraint('OrgStructurePlacement_pkey', ['teamId', 'levelId'])
      .execute()
    await trx.schema
      .createIndex('idx_OrgStructurePlacement_valueId')
      .ifNotExists()
      .on('OrgStructurePlacement')
      .column('valueId')
      .execute()
  })
}

// postgres can't drop a single enum value without rebuilding the type, and tokens may already hold
// reports:read or reports:write, so OAuthScopeEnum keeps them
export async function down(db: Kysely<any>): Promise<void> {
  await createIndexConcurrently(db, {
    name: 'idx_NewMeeting_teamId',
    table: 'NewMeeting',
    columns: ['teamId']
  })
  for (const {name} of INDEXES)
    await sql`DROP INDEX CONCURRENTLY IF EXISTS ${sql.id(name)}`.execute(db)
  await db.transaction().execute(async (trx) => {
    await trx.schema.dropTable('OrgStructurePlacement').ifExists().execute()
    await trx.schema.dropTable('OrgStructureValue').ifExists().execute()
    await trx.schema.dropTable('OrgStructureLevel').ifExists().execute()
    await trx.schema.dropTable('PinnedReport').ifExists().execute()
    await trx.schema.dropTable('ReportQuestion').ifExists().execute()
    await sql`DROP FUNCTION IF EXISTS "trimReportQuestions"()`.execute(trx)
    await trx.schema.dropType('ReportQuestionOutcomeEnum').ifExists().execute()
    await trx.schema.dropType('ReportQuestionSourceEnum').ifExists().execute()
    await trx.schema.dropTable('PopularReportQuestion').ifExists().execute()
    await sql`DROP TRIGGER IF EXISTS "set_Task_doneAt" ON "Task"`.execute(trx)
    await sql`DROP FUNCTION IF EXISTS public."set_Task_doneAt"()`.execute(trx)
    await trx.schema.alterTable('Task').dropColumn('doneAt').execute()
  })
}
