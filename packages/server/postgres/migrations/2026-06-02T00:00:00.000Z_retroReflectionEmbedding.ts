import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TYPE "EmbeddingsObjectTypeEnum" ADD VALUE IF NOT EXISTS 'retroReflection'`.execute(
    db
  )
}

export async function down(_db: Kysely<any>): Promise<void> {
  // Postgres does not support removing enum values
}
