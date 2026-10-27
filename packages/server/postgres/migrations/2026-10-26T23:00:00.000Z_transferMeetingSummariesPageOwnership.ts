import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // Meeting Summaries pages made at runtime were never flagged, and their owners kept them after leaving the team.
  // The page belongs to the team: an owner who left hands it to the team lead, or the oldest member if leaderless.
  // Summaries are left alone, and teams with nobody left keep their owner
  await sql`
    UPDATE "Page" SET "isMeetingTOC" = TRUE
    WHERE "id" IN (SELECT "meetingTOCpageId" FROM "Team" WHERE "meetingTOCpageId" IS NOT NULL)
      AND "isMeetingTOC" = FALSE;

    CREATE TEMP TABLE "affectedAccess" ("userId" VARCHAR, "pageId" INT) ON COMMIT DROP;

    WITH "teamOwner" AS (
      SELECT DISTINCT ON ("teamId") "teamId", "userId"
      FROM "TeamMember"
      WHERE "isNotRemoved" = TRUE
      ORDER BY "teamId", "isLead" DESC, "createdAt"
    ),
    "departedOwners" AS (
      SELECT pua."pageId", pua."userId" AS "departedUserId", o."userId" AS "teamOwnerId"
      FROM "Team" t
      JOIN "PageUserAccess" pua ON pua."pageId" = t."meetingTOCpageId" AND pua."role" = 'owner'
      JOIN "teamOwner" o ON o."teamId" = t."id"
      WHERE NOT EXISTS (
        SELECT 1 FROM "TeamMember" tm
        WHERE tm."teamId" = t."id" AND tm."userId" = pua."userId" AND tm."isNotRemoved" = TRUE
      )
    ),
    "removedOwners" AS (
      DELETE FROM "PageUserAccess" pua USING "departedOwners" d
      WHERE pua."pageId" = d."pageId" AND pua."userId" = d."departedUserId"
      RETURNING pua."userId", pua."pageId"
    ),
    "newOwners" AS (
      INSERT INTO "PageUserAccess" ("pageId", "userId", "role")
      SELECT DISTINCT "pageId", "teamOwnerId", 'owner'::"PageRoleEnum" FROM "departedOwners"
      ON CONFLICT ("pageId", "userId") DO UPDATE SET "role" = 'owner'
      RETURNING "userId", "pageId"
    )
    INSERT INTO "affectedAccess"
    SELECT "userId", "pageId" FROM "removedOwners"
    UNION SELECT "userId", "pageId" FROM "newOwners";

    SELECT "updatePageAccess"(ARRAY["userId"]::VARCHAR[], ARRAY_AGG(DISTINCT "pageId"))
    FROM "affectedAccess"
    GROUP BY "userId";
  `.execute(db)
}

export async function down(): Promise<void> {}
