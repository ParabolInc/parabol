import {type Kysely, sql} from 'kysely'
import type {MigrationConfig} from 'kysely/migration'

const RECENT_QUESTION_LIMIT = 20

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
      .addColumn('shape', 'varchar(1000)')
      .addColumn('dedupeKey', 'varchar(24)', (col) => col.notNull())
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
      .addColumn('createdBy', 'varchar(100)', (col) =>
        col.references('User.id').onDelete('set null')
      )
      .addColumn('source', sql`"ReportQuestionSourceEnum"`)
      .addColumn('question', 'varchar(500)')
      // a pin copied from the built-in ones keeps the key of its popular question
      .addColumn('builtInKey', 'varchar(100)')
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
    await sql`DROP TRIGGER IF EXISTS "set_Task_doneAt" ON "Task"`.execute(trx)
    await sql`DROP FUNCTION IF EXISTS public."set_Task_doneAt"()`.execute(trx)
    await trx.schema.alterTable('Task').dropColumn('doneAt').execute()
  })
}
