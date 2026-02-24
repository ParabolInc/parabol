import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('JiraExport')
    .addColumn('cloudId', 'varchar(100)', (col) => col.primaryKey())
    .addColumn('exportCount', 'integer', (col) => col.defaultTo(0).notNull())
    .addColumn('limitReachedAt', 'timestamptz')
    .execute()

  await sql`
    INSERT INTO "JiraExport" ("cloudId", "exportCount")
    SELECT integration->>'cloudId', COUNT(*)::integer
    FROM "Task"
    WHERE integration->>'service' = 'jira'
      AND integration->>'cloudId' IS NOT NULL
    GROUP BY integration->>'cloudId'
    ON CONFLICT ("cloudId") DO UPDATE
      SET "exportCount" = "JiraExport"."exportCount" + EXCLUDED."exportCount"
  `.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('JiraExport').execute()
}
