import type {Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await Promise.all([
    db.schema.alterTable('EmbeddingsJobQueueV2').renameColumn('model', 'modelId').execute(),
    db.schema.alterTable('EmbeddingsFailures').renameColumn('model', 'modelId').execute()
  ])
}

export async function down(db: Kysely<any>): Promise<void> {
  await Promise.all([
    db.schema.alterTable('EmbeddingsJobQueueV2').renameColumn('modelId', 'model').execute(),
    db.schema.alterTable('EmbeddingsFailures').renameColumn('modelId', 'model').execute()
  ])
}
