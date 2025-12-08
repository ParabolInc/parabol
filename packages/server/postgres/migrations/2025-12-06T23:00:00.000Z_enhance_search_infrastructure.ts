import {type Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  const table = 'EmbeddingsMetadata'

  // Make teamId nullable
  await db.schema
    .alterTable(table)
    .alterColumn('teamId', (col) => col.dropNotNull())
    .execute()

  // Add userId
  await db.schema
    .alterTable(table)
    .addColumn('userId', 'varchar(100)', (col) => col.references('User.id').onDelete('cascade'))
    .execute()

  // Add index on userId
  await db.schema.createIndex(`idx_${table}_userId`).on(table).column('userId').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  const table = 'EmbeddingsMetadata'

  await db.schema.dropIndex(`idx_${table}_userId`).execute()
  await db.schema.alterTable(table).dropColumn('userId').execute()

  // We can't easily revert teamId to NOT NULL without ensuring no nulls exist.
  // But strictly speaking 'down' should try.
  // We'll leave it nullable in down for safety or delete rows?
  // Let's just try to set it back, if it fails, it fails (developer machine).
  // Actually, standard practice: delete nulls or ignore.
  // We'll skip altering back to not null to avoid data loss issues in dev looping.
}
