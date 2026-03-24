import {type Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await Promise.all([
    db.schema
      .createIndex('idx_EmbeddingsMetadata_objectType_teamId')
      .on('EmbeddingsMetadata')
      .columns(['objectType', 'teamId'])
      .execute(),
    db.schema.dropIndex('idx_EmbeddingsMetadata_objectType').execute(),
    db.schema.dropIndex('idx_EmbeddingsMetadata_teamId').execute()
  ])
}

export async function down(db: Kysely<any>): Promise<void> {
  await Promise.all([
    db.schema
      .createIndex('idx_EmbeddingsMetadata_objectType')
      .on('EmbeddingsMetadata')
      .column('objectType')
      .execute(),
    db.schema
      .createIndex('idx_EmbeddingsMetadata_teamId')
      .on('EmbeddingsMetadata')
      .column('teamId')
      .execute(),
    db.schema.dropIndex('idx_EmbeddingsMetadata_objectType_teamId').execute()
  ])
}
