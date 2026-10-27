import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // Meeting Summaries pages made at runtime were never flagged, every summary copied the summaries page's owner
  // as a second owner, and that owner kept control after leaving the team.
  // Each page keeps one owner: the summaries page's owner must be on the team, a summary's is whoever ended the meeting
  await sql`
    CREATE TEMP TABLE "affectedAccess" ("userId" VARCHAR, "pageId" INT) ON COMMIT DROP;

    UPDATE "Page" SET "isMeetingTOC" = TRUE
    WHERE "id" IN (SELECT "meetingTOCpageId" FROM "Team" WHERE "meetingTOCpageId" IS NOT NULL)
      AND "isMeetingTOC" = FALSE;

    WITH "copiedOwners" AS (
      DELETE FROM "PageUserAccess" pua USING "Page" p
      WHERE pua."pageId" = p."id"
        AND p."summaryMeetingId" IS NOT NULL
        AND pua."role" = 'owner'
        AND pua."userId" <> p."userId"
      RETURNING pua."userId", pua."pageId"
    )
    INSERT INTO "affectedAccess" SELECT "userId", "pageId" FROM "copiedOwners";

    WITH "departedOwners" AS (
      SELECT pua."pageId", pua."userId" AS "ownerId", lead."userId" AS "leadId"
      FROM "Team" t
      JOIN "PageUserAccess" pua ON pua."pageId" = t."meetingTOCpageId" AND pua."role" = 'owner'
      JOIN "TeamMember" lead ON lead."teamId" = t."id" AND lead."isLead" = TRUE AND lead."isNotRemoved" = TRUE
      WHERE NOT EXISTS (
        SELECT 1 FROM "TeamMember" tm
        WHERE tm."teamId" = t."id" AND tm."userId" = pua."userId" AND tm."isNotRemoved" = TRUE
      )
    ),
    "removedOwners" AS (
      DELETE FROM "PageUserAccess" pua USING "departedOwners" d
      WHERE pua."pageId" = d."pageId" AND pua."userId" = d."ownerId"
      RETURNING pua."userId", pua."pageId"
    ),
    "newOwners" AS (
      INSERT INTO "PageUserAccess" ("pageId", "userId", "role")
      SELECT "pageId", "leadId", 'owner' FROM "departedOwners"
      ON CONFLICT ("pageId", "userId") DO UPDATE SET "role" = 'owner'
      RETURNING "userId", "pageId"
    )
    INSERT INTO "affectedAccess"
    SELECT "userId", "pageId" FROM "removedOwners"
    UNION SELECT "userId", "pageId" FROM "newOwners";

    SELECT "updatePageAccess"(ARRAY[a."userId"]::VARCHAR[], ARRAY[a."pageId"])
    FROM (SELECT DISTINCT "userId", "pageId" FROM "affectedAccess") a;
  `.execute(db)
}

export async function down(): Promise<void> {}
