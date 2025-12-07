import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // Add 'page' to EmbeddingsObjectTypeEnum
  // Postgres doesn't support IF NOT EXISTS for ADD VALUE, but it throws if it exists, so we can wrap in a block or check first.
  // Actually, newer Postgres versions support IF NOT EXISTS? No, only 12+? Parabol uses 16.
  // "ALTER TYPE ... ADD VALUE IF NOT EXISTS" is supported in Postgres 12+.
  await sql`ALTER TYPE "EmbeddingsObjectTypeEnum" ADD VALUE IF NOT EXISTS 'page'`.execute(db)

  // Add tsv column to known embedding tables
  const tables = ['Embeddings_ember_1', 'Embeddings_bge_l_en_1p5']
  for (const table of tables) {
    // Check if table exists
    const hasTable = await sql<{exists: boolean}>`
      SELECT EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = ${table}
      )`.execute(db)

    if (hasTable.rows[0].exists) {
      await sql`
        ALTER TABLE ${sql.id(table)}
        ADD COLUMN IF NOT EXISTS "tsv" tsvector
      `.execute(db)

      // Populate tsv from embedText
      await sql`
        UPDATE ${sql.id(table)}
        SET "tsv" = to_tsvector('english', "embedText")
        WHERE "tsv" IS NULL AND "embedText" IS NOT NULL
      `.execute(db)

      // Populate tsv from EmbeddingsMetadata when embedText is null
      await sql`
        UPDATE ${sql.id(table)} e
        SET "tsv" = to_tsvector('english', m."fullText")
        FROM "EmbeddingsMetadata" m
        WHERE e."embeddingsMetadataId" = m.id
        AND e."embedText" IS NULL
        AND e."tsv" IS NULL
      `.execute(db)

      // Add index
      await sql`
        CREATE INDEX IF NOT EXISTS ${sql.id(`idx_${table}_tsv`)}
        ON ${sql.id(table)} USING GIN ("tsv")
      `.execute(db)
    }
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const tables = ['Embeddings_ember_1', 'Embeddings_bge_l_en_1p5']
  for (const table of tables) {
     const hasTable = await sql<{exists: boolean}>`
      SELECT EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = ${table}
      )`.execute(db)

      if (hasTable.rows[0].exists) {
        await sql`ALTER TABLE ${sql.id(table)} DROP COLUMN IF EXISTS "tsv"`.execute(db)
      }
  }
}
