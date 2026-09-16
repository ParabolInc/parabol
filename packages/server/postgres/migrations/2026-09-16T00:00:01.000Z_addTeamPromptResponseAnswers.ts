import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('TeamPromptResponse')
    .addColumn('isShared', 'boolean', (col) => col.notNull().defaultTo(true))
    .execute()
  await db.schema.alterTable('TeamPromptResponse').addColumn('sharedAt', 'timestamptz').execute()
  await db
    .updateTable('TeamPromptResponse')
    .set({sharedAt: sql`"createdAt"`})
    .where('sharedAt', 'is', null)
    .execute()

  await db.schema
    .createTable('TeamPromptResponseAnswer')
    .ifNotExists()
    .addColumn('id', 'integer', (col) => col.generatedByDefaultAsIdentity().primaryKey())
    .addColumn('responseId', 'integer', (col) =>
      col.notNull().references('TeamPromptResponse.id').onDelete('cascade')
    )
    .addColumn('promptId', 'varchar(100)', (col) =>
      col.notNull().references('ReflectPrompt.id').onDelete('cascade')
    )
    .addColumn('content', 'jsonb', (col) => col.notNull())
    .addColumn('plaintextContent', 'text', (col) => col.notNull())
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addUniqueConstraint('uniq_TeamPromptResponseAnswer_responseId_promptId', [
      'responseId',
      'promptId'
    ])
    .execute()

  await sql`
    CREATE TRIGGER "update_TeamPromptResponseAnswer_updatedAt"
    BEFORE UPDATE ON "TeamPromptResponseAnswer"
    FOR EACH ROW
    EXECUTE FUNCTION "set_updatedAt"();
  `.execute(db)
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('TeamPromptResponseAnswer').ifExists().execute()
  await db.schema.alterTable('TeamPromptResponse').dropColumn('sharedAt').execute()
  await db.schema.alterTable('TeamPromptResponse').dropColumn('isShared').execute()
}
