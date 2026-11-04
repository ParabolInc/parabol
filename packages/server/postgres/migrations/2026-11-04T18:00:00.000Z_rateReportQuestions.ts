import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.createType('ReportQuestionRatingEnum').asEnum(['good', 'bad']).execute()
  // Each rating keeps the question and the report it rated, since a person's recent questions are trimmed and
  // asking again rewrites them. A null rating is one taken back
  await db.schema
    .createTable('ReportQuestionRating')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('reportQuestionId', 'integer', (col) =>
      col.references('ReportQuestion.id').onDelete('set null')
    )
    .addColumn('userId', 'varchar(100)', (col) =>
      col.notNull().references('User.id').onDelete('cascade')
    )
    .addColumn('orgId', 'varchar(100)', (col) =>
      col.notNull().references('Organization.id').onDelete('cascade')
    )
    .addColumn('question', 'varchar(500)', (col) => col.notNull())
    .addColumn('title', 'varchar(255)', (col) => col.notNull())
    .addColumn('aiSpec', 'jsonb')
    .addColumn('spec', 'jsonb', (col) => col.notNull())
    .addColumn('rating', sql`"ReportQuestionRatingEnum"`)
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()
  await db.schema
    .createIndex('idx_ReportQuestionRating_reportQuestionId_createdAt')
    .on('ReportQuestionRating')
    .columns(['reportQuestionId', 'createdAt'])
    .execute()
  await db.schema
    .createIndex('idx_ReportQuestionRating_userId')
    .on('ReportQuestionRating')
    .column('userId')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('ReportQuestionRating').ifExists().execute()
  await db.schema.dropType('ReportQuestionRatingEnum').ifExists().execute()
}
