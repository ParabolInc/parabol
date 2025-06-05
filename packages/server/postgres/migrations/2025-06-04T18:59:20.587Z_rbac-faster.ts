import {sql, type Kysely} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('PageAccess')
    .addPrimaryKeyConstraint('PageAccess_pk', ['pageId', 'userId'])
    .execute()

  await db.schema
    .alterTable('Page')
    .addColumn('lastAdminUserId', 'varchar(100)', (col) =>
      col.references('User.id').onDelete('set null')
    )
    .execute()

  await sql`
DROP TRIGGER IF EXISTS "trg_unlink_on_restriction_user";
DROP TRIGGER IF EXISTS "trg_unlink_on_restriction_external";
DROP TRIGGER IF EXISTS "trg_unlink_on_restriction_team";
DROP TRIGGER IF EXISTS "trg_unlink_on_restriction_org";
DROP TRIGGER IF EXISTS "trg_propagate_access_user";
DROP TRIGGER IF EXISTS "trg_propagate_access_team";
DROP TRIGGER IF EXISTS "trg_propagate_access_external";
DROP TRIGGER IF EXISTS "trg_propagate_access_org";
DROP FUNCTION IF EXISTS "updatePageAccess";
DROP FUNCTION IF EXISTS "maybeMarkPrivate";
DROP FUNCTION IF EXISTS "unlinkFromParentPage";
DROP FUNCTION IF EXISTS "propagateAccessToChildPagesUser";
DROP FUNCTION IF EXISTS "propagateAccessToChildPagesTeam";
DROP FUNCTION IF EXISTS "propagateAccessToChildPagesExternal";
DROP FUNCTION IF EXISTS "propagateAccessToChildPagesOrganization";

-- UPDATE Page.isPrivate
CREATE OR REPLACE FUNCTION "maybeMarkPrivate"("_pageIds" INT[])
RETURNS VOID AS $$
DECLARE
  "_willBePrivate" BOOLEAN;
BEGIN
  WITH "PagePrivacyCalc" AS (
    SELECT
      p.id,
      p."isPrivate" AS "currentPrivate",
      (
        (SELECT COUNT(*) = 1 FROM "PageUserAccess"         WHERE "pageId" = p.id LIMIT 2) AND
        NOT EXISTS (SELECT 1 FROM "PageTeamAccess"         WHERE "pageId" = p.id LIMIT 1) AND
        NOT EXISTS (SELECT 1 FROM "PageOrganizationAccess" WHERE "pageId" = p.id LIMIT 1) AND
        NOT EXISTS (SELECT 1 FROM "PageExternalAccess"     WHERE "pageId" = p.id LIMIT 1)
      ) AS "shouldBePrivate"
    FROM "Page" p
    WHERE p.id = ANY("_pageIds")
  )
  UPDATE "Page"
  SET "isPrivate" = ppc."shouldBePrivate"
  FROM "PagePrivacyCalc" ppc
  WHERE "Page".id = ppc.id
    AND "Page"."isPrivate" <> ppc."shouldBePrivate";
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION "updatePageAccess"(
  "_userIds" VARCHAR[],
  "_pageIds" INT[]
) RETURNS VOID AS $$
BEGIN
  WITH
    -- 1. Compute effective roles across userId + pageId combinations
    effective_roles AS (
      SELECT "userId", "pageId", MIN(role) AS "strongestRole"
      FROM (
        SELECT pua."userId", pua."pageId", pua.role
        FROM "PageUserAccess" pua
        WHERE pua."userId" = ANY("_userIds") AND pua."pageId" = ANY("_pageIds")

        UNION ALL

        SELECT tm."userId", pta."pageId", pta.role
        FROM "PageTeamAccess" pta
        JOIN "TeamMember" tm ON pta."teamId" = tm."teamId"
        WHERE tm."userId" = ANY("_userIds") AND pta."pageId" = ANY("_pageIds")

        UNION ALL

        SELECT ou."userId", poa."pageId", poa.role
        FROM "PageOrganizationAccess" poa
        JOIN "OrganizationUser" ou ON poa."orgId" = ou."orgId"
        WHERE ou."userId" = ANY("_userIds") AND poa."pageId" = ANY("_pageIds")
      ) combined
      GROUP BY "userId", "pageId"
    ),

    -- 2. Existing explicit access entries
    existing_access AS (
      SELECT "userId", "pageId", role AS "currentRole"
      FROM "PageAccess"
      WHERE "userId" = ANY("_userIds") AND "pageId" = ANY("_pageIds")
    ),

    -- 3. Which roles to upsert (new or changed)
    to_upsert AS (
      SELECT er."userId", er."pageId", er."strongestRole"
      FROM effective_roles er
      LEFT JOIN existing_access ea ON ea."userId" = er."userId" AND ea."pageId" = er."pageId"
      WHERE ea."currentRole" IS DISTINCT FROM er."strongestRole"
    ),

    -- 4. Which existing roles should be removed (no longer inherited)
    to_delete AS (
      SELECT ea."userId", ea."pageId"
      FROM existing_access ea
      LEFT JOIN effective_roles er ON er."userId" = ea."userId" AND er."pageId" = ea."pageId"
      WHERE er."userId" IS NULL
    ),

    -- 5. Perform UPSERT
    upserted AS (
      INSERT INTO "PageAccess" ("userId", "pageId", role)
      SELECT "userId", "pageId", "strongestRole" FROM to_upsert
      ON CONFLICT ("userId", "pageId") DO UPDATE
      SET role = EXCLUDED.role
      WHERE "PageAccess".role IS DISTINCT FROM EXCLUDED.role
    )

  -- 6. Perform DELETE
  DELETE FROM "PageAccess"
  USING to_delete td
  WHERE "PageAccess"."userId" = td."userId"
    AND "PageAccess"."pageId" = td."pageId";

  PERFORM "maybeMarkPrivate"("_pageIds");
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION "updateUserPageAccess"() RETURNS TRIGGER AS $$
DECLARE
  "_userId" VARCHAR := COALESCE(NEW."userId", OLD."userId");
  "_pageId" INT := COALESCE(NEW."pageId", OLD."pageId");
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO "PageAccess" ("userId", "pageId", "role")
    VALUES("_userId", "_pageId", NEW.role)
    ON CONFLICT ("userId", "pageId") DO UPDATE
    SET role = EXCLUDED.role
    WHERE "PageAccess".role > EXCLUDED.role;
    UPDATE "Page" SET "isPrivate" = FALSE WHERE id = "_pageId" AND "isPrivate" = TRUE;
  ELSIF TG_OP = 'DELETE' OR NEW.role != OLD.role
    PERFORM "updatePageAccess"(ARRAY["_userId"],ARRAY["_pageId"]);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION "updateTeamPageAccess"() RETURNS TRIGGER AS $$
DECLARE
  "_userIds" VARCHAR[];
  "_pageId" INT := COALESCE(NEW."pageId", OLD."pageId");
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO "PageAccess" ("userId", "pageId", "role")
    SELECT "TeamMember"."userId", "_pageId", NEW.role
    FROM "TeamMember"
    LEFT JOIN "PageAccess" ON "TeamMember"."userId" = "PageAccess"."userId"
    WHERE "TeamMember"."teamId" = NEW."teamId"
    AND "pageId" = NEW."pageId"
    AND ("PageAccess".role IS NULL OR NEW."role" < "PageAccess".role)
    ON CONFLICT ("userId", "pageId") DO UPDATE
    SET role = EXCLUDED.role
    WHERE "PageAccess".role > EXCLUDED.role;
    UPDATE "Page" SET "isPrivate" = FALSE WHERE id = "_pageId" AND "isPrivate" = TRUE;
  ELSIF TG_OP = 'DELETE' OR NEW.role != OLD.role
    SELECT ARRAY(SELECT "userId" FROM "TeamMember" WHERE "teamId" = OLD."teamId") INTO "_userIds";
    PERFORM "updatePageAccess"("_userIds", "_pageId");
	END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION "updateOrganizationPageAccess"() RETURNS TRIGGER AS $$
DECLARE
  "_userIds" VARCHAR[];
  "_pageId" INT := COALESCE(NEW."pageId", OLD."pageId");
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO "PageAccess" ("userId", "pageId", "role")
    SELECT "OrganizationUser"."userId", "_pageId", NEW.role
    FROM "OrganizationUser"
    LEFT JOIN "PageAccess" ON "OrganizationUser"."userId" = "PageAccess"."userId"
    WHERE "OrganizationUser"."orgId" = NEW."orgId"
    AND "pageId" = NEW."pageId"
    AND ("PageAccess".role IS NULL OR NEW."role" < "PageAccess".role)
    ON CONFLICT ("userId", "pageId") DO UPDATE
    SET role = EXCLUDED.role
    WHERE "PageAccess".role > EXCLUDED.role;
    UPDATE "Page" SET "isPrivate" = FALSE WHERE id = "_pageId" AND "isPrivate" = TRUE;
  ELSIF TG_OP = 'DELETE' OR NEW.role != OLD.role
    SELECT ARRAY(SELECT "userId" FROM "OrganizationUser" WHERE "orgId" = OLD."orgId") INTO "_userIds";
    PERFORM "updatePageAccess"("_userIds", "_pageId");
	END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- HANDLE JOIN/LEAVE TEAM
CREATE OR REPLACE FUNCTION "updateTeamPageAccessByTeamMember"() RETURNS TRIGGER AS $$
DECLARE
  "_pageId" INT;
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
      FOR "_pageId" IN
        SELECT "pageId"
        FROM "PageTeamAccess"
        WHERE "teamId" = COALESCE(NEW."teamId", OLD."teamId")
      LOOP
        PERFORM "updatePageAccess"(ARRAY["_userId"], "_pageId");
      END LOOP;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;



-- HANDLE JOIN/LEAVE ORG
CREATE OR REPLACE FUNCTION "updateOrgPageAccessByOrgUser"()
RETURNS TRIGGER AS $$
DECLARE
  "_pageId" INT;
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
      FOR "_pageId" IN
        SELECT "pageId"
        FROM "PageOrganizationAccess"
        WHERE "orgId" = COALESCE(NEW."orgId", OLD."orgId")
      LOOP
        PERFORM "updatePageAccess"(ARRAY["_userId"], "_pageId");
      END LOOP;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION "removePageAccessOnTeamArchive"() RETURNS TRIGGER AS $$
DECLARE
  affected_page_id INT;
BEGIN
  IF NEW."isArchived" = TRUE AND OLD."isArchived" != TRUE THEN
    WITH deleted_team_access AS (
      DELETE FROM "PageTeamAccess"
      WHERE "teamId" = NEW."id"
      RETURNING "pageId"
    ),
    pages_without_owner AS (
      SELECT DISTINCT dta."pageId"
      FROM deleted_team_access dta
      WHERE NOT EXISTS (
        SELECT 1
        FROM "PageAccess" pa
        WHERE pa."pageId" = dta."pageId" AND pa."role" = 'owner'
      )
    )
    DELETE FROM "Page"
    USING pages_without_owner pwo
    WHERE "Page"."id" = pwo."pageId";
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION "updateExternalPageAccess"() RETURNS TRIGGER AS $$
BEGIN
  PERFORM "maybeMarkPrivate"(ARRAY[COALESCE(NEW."pageId", OLD."pageId")]);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;


-- Create shared sortOrder
CREATE OR REPLACE FUNCTION "addSharedPageSortOrder"() RETURNS TRIGGER AS $$
DECLARE
  "_wasShared" BOOLEAN := (OLD."teamId" IS NULL AND OLD."parentPageId" IS NULL AND OLD."isPrivate" = false);
  "_isShared" BOOLEAN := (NEW."teamId" IS NULL AND NEW."parentPageId" IS NULL AND NEW."isPrivate" = false);
BEGIN
  IF "_wasShared" != "_isShared" THEN
    IF "_isShared" THEN
      INSERT INTO "PageUserSortOrder" ("userId", "pageId", "sortOrder")
      SELECT
        pa."userId",
        NEW."id",
        position_before(
          COALESCE(
            (
              SELECT "sortOrder"
              FROM "PageUserSortOrder" s
              WHERE s."userId" = pa."userId"
              ORDER BY "sortOrder"
              LIMIT 1
            ),
            ' '
          )
        )
      FROM "PageAccess" pa
      WHERE pa."pageId" = NEW."id";
    ELSE
      DELETE FROM "PageUserSortOrder"
      WHERE "pageId" = NEW."id";
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
`.execute(db)
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('PageAccess').dropConstraint('PageAccess_pk').execute()
}
