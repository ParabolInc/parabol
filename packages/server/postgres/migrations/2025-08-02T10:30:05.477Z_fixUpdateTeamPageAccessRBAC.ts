import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await sql`
CREATE OR REPLACE FUNCTION "updateTeamPageAccessByTeamMember"() RETURNS TRIGGER AS $$
DECLARE
  "_pageIds" INT[];
  "_userId" VARCHAR := COALESCE(NEW."userId", OLD."userId");
BEGIN
  IF TG_OP != 'UPDATE' OR NEW."isNotRemoved" != OLD."isNotRemoved" THEN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO "PageAccess" ("pageId", role, "userId")
      SELECT "pageId", role, "_userId"
      FROM "PageTeamAccess"
      WHERE "teamId" = NEW."teamId"
      ON CONFLICT ("userId", "pageId") DO UPDATE
      SET role = EXCLUDED.role
      WHERE "PageAccess".role > EXCLUDED.role;
    ELSE
      SELECT ARRAY(SELECT "pageId"
        FROM "PageTeamAccess"
        WHERE "teamId" = COALESCE(NEW."teamId", OLD."teamId")
      ) INTO "_pageIds";
      PERFORM "updatePageAccess"(ARRAY["_userId"], "_pageIds");
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION "removePageAccessOnTeamArchive"() RETURNS TRIGGER AS $$
DECLARE
  "_pageIds" INT[];
  "_userIds" VARCHAR[];
BEGIN
  IF NEW."isArchived" = TRUE AND OLD."isArchived" != TRUE THEN
    WITH "deleted" AS (
      DELETE FROM "PageTeamAccess"
      WHERE "teamId" = NEW."id"
      RETURNING "pageId"
    ) SELECT ARRAY(
      SELECT "pageId" FROM "deleted"
    ) INTO "_pageIds";
    SELECT ARRAY(
      SELECT "userId" FROM "TeamMember" WHERE "teamId" = NEW."id"
    ) INTO "_userIds";
    PERFORM "updatePageAccess"("_userIds", "_pageIds");
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

`.execute(db)
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  // We should not go back to the broken function
}
