import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // Meeting Summaries pages made at runtime were never flagged, and people kept their direct access to them after
  // leaving the team, so every new summary inherited it. Former members lose that access; an owner among them hands
  // the page to the team lead, or the oldest member if leaderless. Teams with nobody left and summaries are untouched
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
    "removedAccess" AS (
      DELETE FROM "PageUserAccess" pua
      USING "Team" t, "TeamMember" former, "teamOwner" o
      WHERE pua."pageId" = t."meetingTOCpageId"
        AND former."teamId" = t."id" AND former."userId" = pua."userId" AND former."isNotRemoved" = FALSE
        AND o."teamId" = t."id"
      RETURNING pua."userId", pua."pageId", pua."role", o."userId" AS "teamOwnerId"
    ),
    "newOwners" AS (
      INSERT INTO "PageUserAccess" ("pageId", "userId", "role")
      SELECT DISTINCT "pageId", "teamOwnerId", 'owner'::"PageRoleEnum" FROM "removedAccess" WHERE "role" = 'owner'
      ON CONFLICT ("pageId", "userId") DO UPDATE SET "role" = 'owner'
      RETURNING "userId", "pageId"
    )
    INSERT INTO "affectedAccess"
    SELECT "userId", "pageId" FROM "removedAccess"
    UNION SELECT "userId", "pageId" FROM "newOwners";

    SELECT "updatePageAccess"(ARRAY["userId"]::VARCHAR[], ARRAY_AGG(DISTINCT "pageId"))
    FROM "affectedAccess"
    GROUP BY "userId";
  `.execute(db)
}

export async function down(): Promise<void> {}
