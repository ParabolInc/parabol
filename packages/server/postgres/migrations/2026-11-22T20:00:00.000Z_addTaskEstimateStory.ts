import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    ALTER TABLE "TaskEstimate"
      ADD COLUMN IF NOT EXISTS "repoId" varchar(255),
      ADD COLUMN IF NOT EXISTS "storyReference" varchar(255),
      ADD COLUMN IF NOT EXISTS "storyTitle" varchar(255),
      ADD COLUMN IF NOT EXISTS "storyDescription" varchar(2000)
  `.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`
    ALTER TABLE "TaskEstimate"
      DROP COLUMN IF EXISTS "repoId",
      DROP COLUMN IF EXISTS "storyReference",
      DROP COLUMN IF EXISTS "storyTitle",
      DROP COLUMN IF EXISTS "storyDescription"
  `.execute(db)
}
