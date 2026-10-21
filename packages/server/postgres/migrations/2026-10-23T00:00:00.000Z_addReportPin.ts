import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // Unpinned reports keep their row, so what people ask for can be compared with what they keep
  await db.schema
    .createTable('ReportPin')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('orgId', 'varchar(100)', (col) =>
      col.notNull().references('Organization.id').onDelete('cascade')
    )
    .addColumn('isBuiltIn', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('createdBy', 'varchar(100)', (col) => col.references('User.id').onDelete('set null'))
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
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('removedAt', 'timestamptz')
    .addColumn('removedBy', 'varchar(100)', (col) => col.references('User.id').onDelete('set null'))
    .execute()
  await db.schema
    .createIndex('idx_ReportPin_orgId')
    .ifNotExists()
    .on('ReportPin')
    .column('orgId')
    .execute()
  await db.schema.alterTable('ReportQuestion').addColumn('editedAt', 'timestamptz').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('ReportQuestion').dropColumn('editedAt').execute()
  await db.schema.dropTable('ReportPin').ifExists().execute()
}
