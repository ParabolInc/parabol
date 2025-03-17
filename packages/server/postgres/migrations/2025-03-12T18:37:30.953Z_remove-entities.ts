import {sql, type Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('RetroReflection').dropColumn('entities').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`
    ALTER TABLE "RetroReflection"
    ADD COLUMN "entities" public."GoogleAnalyzedEntity"[] DEFAULT ARRAY[]::public."GoogleAnalyzedEntity"[] NOT NULL;
  `.execute(db)
}
