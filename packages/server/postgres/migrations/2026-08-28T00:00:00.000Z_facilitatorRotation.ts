import type {Kysely} from 'kysely'
import {sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    ALTER TABLE "TeamMember" ADD COLUMN IF NOT EXISTS "facilitatorOrder" SMALLINT;
    ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "autoAssignFacilitator" BOOLEAN NOT NULL DEFAULT FALSE;
  `.execute(db)
  // a NULL order means the member joined since the last rotation, which puts them at the top of
  // the line. Seed the existing roster by tenure so nobody starts out as a newcomer.
  await sql`
    UPDATE "TeamMember" AS tm
    SET "facilitatorOrder" = seeded."facilitatorOrder"
    FROM (
      SELECT "id", ROW_NUMBER() OVER (PARTITION BY "teamId" ORDER BY "createdAt", "id") AS "facilitatorOrder"
      FROM "TeamMember"
    ) AS seeded
    WHERE tm."id" = seeded."id";
  `.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`
    ALTER TABLE "TeamMember" DROP COLUMN IF EXISTS "facilitatorOrder";
    ALTER TABLE "Team" DROP COLUMN IF EXISTS "autoAssignFacilitator";
  `.execute(db)
}
