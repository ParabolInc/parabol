import {type Kysely, sql} from 'kysely'

// The AI summary of how a team feels about one category in one Team Health check, and the sentiment
// read alongside it. A row is written when the results are revealed, empty while the model works,
// and removed if no summary comes of it, so a check and category with no row has no summary.
// `any` is required here since migrations should be frozen in time.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('TeamHealthCategorySummary')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('meetingId', 'varchar(100)', (col) =>
      col.notNull().references('NewMeeting.id').onDelete('cascade')
    )
    .addColumn('categoryId', 'integer', (col) =>
      col.notNull().references('TeamHealthCategory.id').onDelete('cascade')
    )
    .addColumn('summary', 'varchar(2000)')
    .addColumn('sentimentScore', 'double precision')
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addUniqueConstraint('uniq_TeamHealthCategorySummary_meetingId_categoryId', [
      'meetingId',
      'categoryId'
    ])
    .addCheckConstraint(
      'ck_TeamHealthCategorySummary_sentimentScore',
      sql`"sentimentScore" BETWEEN -1 AND 1`
    )
    .addCheckConstraint(
      'ck_TeamHealthCategorySummary_writtenTogether',
      sql`("summary" IS NULL) = ("sentimentScore" IS NULL)`
    )
    .execute()
}

// `any` is required here since migrations should be frozen in time.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('TeamHealthCategorySummary').ifExists().execute()
}
