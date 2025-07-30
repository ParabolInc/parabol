import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    DROP TRIGGER IF EXISTS "trg_org_page_access" ON "PageOrganizationAccess";
    DROP TRIGGER IF EXISTS "trg_team_page_access" ON "PageTeamAccess";
    DROP TRIGGER IF EXISTS "trg_user_page_access" ON "PageUserAccess";
    DROP TRIGGER IF EXISTS "trg_add_access_on_new_page" ON "Page";
    DROP FUNCTION IF EXISTS "updateOrganizationPageAccess";
    DROP FUNCTION IF EXISTS "updateTeamPageAccess";
    DROP FUNCTION IF EXISTS "updateUserPageAccess";
    DROP FUNCTION IF EXISTS "addAccessOnNewPage";

    -- HANDLE JOIN/LEAVE ORG
CREATE OR REPLACE FUNCTION "updateOrgPageAccessByOrgUser"()
RETURNS TRIGGER AS $$
DECLARE
  "_pageIds" INT[];
  "_userId" VARCHAR := COALESCE(NEW."userId", OLD."userId");
BEGIN
  IF TG_OP != 'UPDATE' OR NEW."removedAt" != OLD."removedAt" THEN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO "PageAccess" ("pageId", role, "userId")
      SELECT "pageId", role, "_userId"
      FROM "PageOrganizationAccess"
      WHERE "orgId" = NEW."orgId"
      ON CONFLICT ("userId", "pageId") DO UPDATE
      SET role = EXCLUDED.role
      WHERE "PageAccess".role > EXCLUDED.role;
    ELSE
      SELECT ARRAY(
        SELECT "pageId" FROM "PageOrganizationAccess" WHERE "orgId" = COALESCE(NEW."orgId", OLD."orgId")
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
    DELETE FROM "PageTeamAccess"
    WHERE "teamId" = NEW."id"
    RETURNING "pageId"
    INTO "_pageIds";
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
  // noop
}
