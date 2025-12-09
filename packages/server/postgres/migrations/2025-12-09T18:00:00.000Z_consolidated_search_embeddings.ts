import {type Kysely, sql} from 'kysely'
import getModelManager from '../../../embedder/ai_models/ModelManager'

export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TYPE "EmbeddingsObjectTypeEnum" ADD VALUE IF NOT EXISTS 'page'`.execute(db)

  await db.schema
    .alterTable('EmbeddingsMetadata')
    .alterColumn('teamId', (col) => col.dropNotNull())
    .addColumn('userId', 'varchar(100)', (col) => col.references('User.id').onDelete('cascade'))
    .execute()

  await db.schema
    .createIndex('idx_EmbeddingsMetadata_userId')
    .on('EmbeddingsMetadata')
    .column('userId')
    .execute()

  const modelManager = getModelManager()
  const tableNames = [...modelManager.embeddingModels.keys()]

  for (const table of tableNames) {
    const hasTable = await sql<{exists: boolean}>`
      SELECT EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = ${table}
      )`.execute(db)

    if (hasTable.rows[0].exists) {
      await sql`
        ALTER TABLE ${sql.id(table)}
        ADD COLUMN IF NOT EXISTS "tsv" tsvector
      `.execute(db)

      await sql`
        UPDATE ${sql.id(table)}
        SET "tsv" = to_tsvector('english', "embedText")
        WHERE "tsv" IS NULL AND "embedText" IS NOT NULL
      `.execute(db)

      await sql`
        UPDATE ${sql.id(table)} e
        SET "tsv" = to_tsvector('english', m."fullText")
        FROM "EmbeddingsMetadata" m
        WHERE e."embeddingsMetadataId" = m.id
        AND e."embedText" IS NULL
        AND e."tsv" IS NULL
      `.execute(db)

      await sql`
        CREATE INDEX IF NOT EXISTS ${sql.id(`idx_${table}_tsv`)}
        ON ${sql.id(table)} USING GIN ("tsv")
      `.execute(db)
    }
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const modelManager = getModelManager()
  const tableNames = [...modelManager.embeddingModels.keys()]

  for (const table of tableNames) {
    const hasTable = await sql<{exists: boolean}>`
      SELECT EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = ${table}
      )`.execute(db)

    if (hasTable.rows[0].exists) {
      await sql`ALTER TABLE ${sql.id(table)} DROP COLUMN IF EXISTS "tsv"`.execute(db)
    }
  }

  await db.schema.dropIndex('idx_EmbeddingsMetadata_userId').execute()
  await db.schema.alterTable('EmbeddingsMetadata').dropColumn('userId').execute()
}
