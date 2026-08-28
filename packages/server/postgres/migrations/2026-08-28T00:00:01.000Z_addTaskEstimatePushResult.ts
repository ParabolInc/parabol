import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "TaskEstimate" ADD COLUMN IF NOT EXISTS "pushResult" jsonb`.execute(db)
  await sql`UPDATE "TaskEstimate" SET "pushResult" = jsonb_build_object('targetKind', 'field', 'fieldId', "jiraFieldId") WHERE "jiraFieldId" IS NOT NULL AND "pushResult" IS NULL`.execute(
    db
  )
  await sql`UPDATE "TaskEstimate" SET "pushResult" = jsonb_build_object('targetKind', 'label', 'labelName', "githubLabelName") WHERE "githubLabelName" IS NOT NULL AND "pushResult" IS NULL`.execute(
    db
  )
  await sql`UPDATE "TaskEstimate" SET "pushResult" = jsonb_build_object('targetKind', 'label', 'labelId', "gitlabLabelId") WHERE "gitlabLabelId" IS NOT NULL AND "pushResult" IS NULL`.execute(
    db
  )
  await sql`UPDATE "TaskEstimate" SET "pushResult" = jsonb_build_object('targetKind', 'field', 'fieldId', "azureDevOpsFieldName") WHERE "azureDevOpsFieldName" IS NOT NULL AND "pushResult" IS NULL`.execute(
    db
  )
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  // The four legacy columns are untouched by up(); estimates pushed AFTER this migration lose their provenance
  await sql`ALTER TABLE "TaskEstimate" DROP COLUMN IF EXISTS "pushResult"`.execute(db)
}
