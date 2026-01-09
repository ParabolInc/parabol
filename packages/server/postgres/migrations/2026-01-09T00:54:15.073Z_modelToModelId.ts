import {type Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await Promise.all([
    db.schema.alterTable('EmbeddingsJobQueueV2').renameColumn('model', 'modelId').execute(),
    db.schema.alterTable('EmbeddingsJobQueueV2').addColumn('pageId', 'integer').execute(),
    db.schema.alterTable('EmbeddingsFailures').renameColumn('model', 'modelId').execute(),
    db.schema.alterTable('EmbeddingsFailures').addColumn('pageId', 'integer').execute()
  ])
  await db.schema
    .createIndex('uidx_page_model_where_page_not_null')
    .on('EmbeddingsJobQueueV2')
    .columns(['pageId', 'modelId'])
    .where('pageId', 'is not', null)
    .unique()
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await Promise.all([
    db.schema.alterTable('EmbeddingsJobQueueV2').renameColumn('modelId', 'model').execute(),
    db.schema.alterTable('EmbeddingsJobQueueV2').dropColumn('pageId').execute(),
    db.schema.alterTable('EmbeddingsFailures').dropColumn('pageId').execute(),
    db.schema.alterTable('EmbeddingsFailures').renameColumn('modelId', 'model').execute()
  ])
}
