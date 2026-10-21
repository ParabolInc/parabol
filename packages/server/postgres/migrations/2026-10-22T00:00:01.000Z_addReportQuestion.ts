import {type Kysely, sql} from 'kysely'

const RECENT_QUESTION_LIMIT = 20

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createType('ReportQuestionSourceEnum')
    .asEnum(['ask', 'popular', 'builder'])
    .execute()
  await db.schema
    .createType('ReportQuestionOutcomeEnum')
    .asEnum(['shown', 'couldNotBuild'])
    .execute()
  await db.schema
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
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('lastUsedAt', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addUniqueConstraint('ReportQuestion_userId_orgId_dedupeKey', ['userId', 'orgId', 'dedupeKey'])
    .execute()
  await db.schema
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
  `.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('ReportQuestion').ifExists().execute()
  await sql`DROP FUNCTION IF EXISTS "trimReportQuestions"()`.execute(db)
  await db.schema.dropType('ReportQuestionOutcomeEnum').ifExists().execute()
  await db.schema.dropType('ReportQuestionSourceEnum').ifExists().execute()
}
