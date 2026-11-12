import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    ALTER TABLE "RetroSuggestedGrouping"
      ADD COLUMN IF NOT EXISTS "requestedMode" "SuggestedGroupsModeEnum",
      ADD COLUMN IF NOT EXISTS "model" varchar(100),
      ADD COLUMN IF NOT EXISTS "reasoningEffort" varchar(20),
      ADD COLUMN IF NOT EXISTS "tokenCost" integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "repairedReflectionCount" integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "groupPhaseCompletedAt" timestamptz,
      ADD COLUMN IF NOT EXISTS "finalReflectionCount" integer,
      ADD COLUMN IF NOT EXISTS "movedReflectionCount" integer
  `.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`
    ALTER TABLE "RetroSuggestedGrouping"
      DROP COLUMN IF EXISTS "requestedMode",
      DROP COLUMN IF EXISTS "model",
      DROP COLUMN IF EXISTS "reasoningEffort",
      DROP COLUMN IF EXISTS "tokenCost",
      DROP COLUMN IF EXISTS "repairedReflectionCount",
      DROP COLUMN IF EXISTS "groupPhaseCompletedAt",
      DROP COLUMN IF EXISTS "finalReflectionCount",
      DROP COLUMN IF EXISTS "movedReflectionCount"
  `.execute(db)
}
