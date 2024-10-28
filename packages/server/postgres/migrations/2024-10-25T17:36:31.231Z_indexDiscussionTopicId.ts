import type {Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createIndex('idx_Discussion_discussionTopicId')
    .ifNotExists()
    .on('Discussion')
    .column('discussionTopicId')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('idx_Discussion_discussionTopicId').ifExists().execute()
}
