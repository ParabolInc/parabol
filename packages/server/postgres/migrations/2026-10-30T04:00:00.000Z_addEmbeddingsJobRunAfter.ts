import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('EmbeddingsJobQueueV2')
    .addColumn('runAfter', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('EmbeddingsJobQueueV2').dropColumn('runAfter').execute()
}
