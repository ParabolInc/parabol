import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // Moves used to rewrite ancestorIds on the moved page only, so its sub-pages kept their old ancestors.
  // Rebuild every page's ancestorIds from the parentPageId chain without marking the pages as updated
  await sql`ALTER TABLE "Page" DISABLE TRIGGER "update_Page_updatedAt"`.execute(db)
  await sql`
    WITH RECURSIVE "tree" AS (
      SELECT "id", '{}'::int[] AS "ancestorIds" FROM "Page" WHERE "parentPageId" IS NULL
      UNION ALL
      SELECT "child"."id", "tree"."ancestorIds" || "tree"."id"
      FROM "Page" AS "child" JOIN "tree" ON "child"."parentPageId" = "tree"."id"
    )
    UPDATE "Page" SET "ancestorIds" = "tree"."ancestorIds"
    FROM "tree"
    WHERE "Page"."id" = "tree"."id" AND "Page"."ancestorIds" IS DISTINCT FROM "tree"."ancestorIds"
  `.execute(db)
  await sql`ALTER TABLE "Page" ENABLE TRIGGER "update_Page_updatedAt"`.execute(db)
}

export async function down(): Promise<void> {}
