import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // create role type
  await sql`
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PageRoleEnum') THEN
      CREATE TYPE "PageRoleEnum" AS ENUM (
        'owner',
        'editor',
        'commenter',
        'viewer'
      );
    END IF;
  END
  $$;`.execute(db)

  // create tables
  await Promise.all([
    db.schema
      .createTable('PageExternalAccess')
      .addColumn('pageId', 'serial', (col) =>
        col.references('Page.id').onDelete('cascade').notNull()
      )
      // if email is * then the page is public
      .addColumn('email', sql`"citext"`, (col) => col.notNull())
      .addColumn('role', sql`"PageRoleEnum"`, (col) => col.notNull())
      .addPrimaryKeyConstraint('PageExternalAccess_pk', ['pageId', 'email'])
      .execute(),
    db.schema
      .createTable('PageUserAccess')
      .addColumn('pageId', 'serial', (col) =>
        col.references('Page.id').onDelete('cascade').notNull()
      )
      .addColumn('userId', 'varchar(100)', (col) =>
        col.references('User.id').onDelete('cascade').notNull()
      )
      .addColumn('role', sql`"PageRoleEnum"`, (col) => col.notNull())
      .addPrimaryKeyConstraint('PageUserAccess_pk', ['pageId', 'userId'])

      .execute(),
    db.schema
      .createTable('PageTeamAccess')
      .addColumn('pageId', 'serial', (col) =>
        col.references('Page.id').onDelete('cascade').notNull()
      )
      .addColumn('teamId', 'varchar(100)', (col) =>
        col.references('Team.id').onDelete('cascade').notNull()
      )
      .addColumn('role', sql`"PageRoleEnum"`, (col) => col.notNull())
      .addPrimaryKeyConstraint('PageTeamAccess_pk', ['pageId', 'teamId'])
      .execute(),
    db.schema
      .createTable('PageOrganizationAccess')
      .addColumn('pageId', 'serial', (col) =>
        col.references('Page.id').onDelete('cascade').notNull()
      )
      .addColumn('orgId', 'varchar(100)', (col) =>
        col.references('Organization.id').onDelete('cascade').notNull()
      )
      .addColumn('role', sql`"PageRoleEnum"`, (col) => col.notNull())
      .addPrimaryKeyConstraint('PageOrganizationAccess_pk', ['pageId', 'orgId'])
      .execute(),
    // this is a cached access table for fast lookup
    db.schema
      .createTable('PageAccess')
      .addColumn('pageId', 'serial', (col) =>
        col.references('Page.id').onDelete('cascade').notNull()
      )
      .addColumn('userId', 'varchar(100)', (col) =>
        col.references('User.id').onDelete('cascade').notNull()
      )
      .addColumn('role', sql`"PageRoleEnum"`, (col) => col.notNull())
      .addPrimaryKeyConstraint('PageAccess_pk', ['pageId', 'userId'])
      .execute(),
    db.schema
      .createTable('PageUserSortOrder')
      .addColumn('pageId', 'serial', (col) =>
        col.references('Page.id').onDelete('cascade').notNull()
      )
      .addColumn('userId', 'varchar(100)', (col) =>
        col.references('User.id').onDelete('cascade').notNull()
      )
      .addColumn('sortOrder', 'varchar(128)', (col) => col.modifyFront(sql`COLLATE pg_catalog."C"`))
      .addPrimaryKeyConstraint('PageUserSortOrder_pk', ['pageId', 'userId'])
      .execute(),
    db.schema
      .alterTable('Page')
      .addColumn('parentPageId', 'integer', (col) => col.references('Page.id').onDelete('cascade'))
      .addColumn('isParentLinked', 'boolean', (col) => col.defaultTo(true).notNull())
      .addColumn('teamId', 'varchar(100)', (col) => col.references('Team.id').onDelete('cascade'))
      .addColumn('isPrivate', 'boolean', (col) => col.defaultTo(true).notNull())
      .addColumn('sortOrder', 'varchar(128)', (col) => col.modifyFront(sql`COLLATE pg_catalog."C"`))
      .addColumn('ancestorIds', sql`integer[]`, (col) => col.notNull().defaultTo('{}'))
      .execute()
  ])
  await sql`
  ALTER TABLE "Page"
    ADD CONSTRAINT team_or_parent_null CHECK (
      "teamId" IS NULL OR "parentPageId" IS NULL
    );`.execute(db)

  await db.updateTable('Page').set({sortOrder: '!'}).execute()
  await db.schema
    .alterTable('Page')
    .alterColumn('sortOrder', (ab) => ab.setNotNull())
    .execute()

  await Promise.all([
    db.schema
      .createIndex('idx_PageExternalAccess_email')
      .on('PageExternalAccess')
      .column('email')
      .execute(),
    db.schema
      .createIndex('idx_PageExternalAccess_pageId')
      .on('PageExternalAccess')
      .column('pageId')
      .execute(),
    db.schema
      .createIndex('idx_PageUserAccess_userId')
      .on('PageUserAccess')
      .column('userId')
      .execute(),
    db.schema
      .createIndex('idx_PageUserAccess_pageId')
      .on('PageUserAccess')
      .column('pageId')
      .execute(),
    db.schema
      .createIndex('idx_PageTeamAccess_teamId')
      .on('PageTeamAccess')
      .column('teamId')
      .execute(),
    db.schema
      .createIndex('idx_PageTeamAccess_pageId')
      .on('PageTeamAccess')
      .column('pageId')
      .execute(),
    db.schema
      .createIndex('idx_PageOrganizationAccess_orgId')
      .on('PageOrganizationAccess')
      .column('orgId')
      .execute(),
    db.schema
      .createIndex('idx_PageOrganizationAccess_pageId')
      .on('PageOrganizationAccess')
      .column('pageId')
      .execute(),
    db.schema.createIndex('idx_PageAccess_userId').on('PageAccess').column('userId').execute(),
    db.schema.createIndex('idx_PageAccess_pageId').on('PageAccess').column('pageId').execute(),
    db.schema
      .createIndex('idx_PageUserSortOrder_userId')
      .on('PageUserSortOrder')
      .column('userId')
      .execute(),
    db.schema
      .createIndex('idx_PageUserSortOrder_pageId')
      .on('PageUserSortOrder')
      .column('pageId')
      .execute(),
    db.schema.createIndex('idx_Page_parentPageId').on('Page').column('parentPageId').execute(),
    db.schema
      .createIndex('idx_Page_teamId')
      .on('Page')
      .column('teamId')
      .where('teamId', 'is not', null)
      .execute()
  ])

  await sql`
-- UPDATE Page.isPrivate
CREATE OR REPLACE FUNCTION "maybeMarkPrivate"("_pageIds" INT[])
RETURNS VOID AS $$
BEGIN
  WITH "PagePrivacyCalc" AS (
    SELECT
      p.id,
      p."isPrivate" AS "currentPrivate",
      (
        (SELECT COUNT(*) > 1 FROM "PageUserAccess"     WHERE "pageId" = p.id LIMIT 2) OR
        EXISTS (SELECT 1 FROM "PageTeamAccess"         WHERE "pageId" = p.id LIMIT 1) OR
        EXISTS (SELECT 1 FROM "PageOrganizationAccess" WHERE "pageId" = p.id LIMIT 1) OR
        EXISTS (SELECT 1 FROM "PageExternalAccess"     WHERE "pageId" = p.id LIMIT 1)
      ) AS "shouldBePublic"
    FROM "Page" p
    WHERE p.id = ANY("_pageIds")
  )
  UPDATE "Page"
  SET "isPrivate" = NOT ppc."shouldBePublic"
  FROM "PagePrivacyCalc" ppc
  WHERE "Page".id = ppc.id
    AND "Page"."isPrivate" = ppc."shouldBePublic";
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


-- PageUserAccess -> PageAccess
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
    UPDATE "Page" SET "isPrivate" = FALSE WHERE id = "_pageId" AND "isPrivate" = TRUE
      AND (SELECT COUNT(*) > 1 FROM "PageUserAccess" WHERE "pageId" = "_pageId" LIMIT 2);
  ELSIF TG_OP = 'DELETE' OR NEW.role != OLD.role THEN
    PERFORM "updatePageAccess"(ARRAY["_userId"],ARRAY["_pageId"]);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE TRIGGER trg_user_page_access
AFTER INSERT OR UPDATE OR DELETE ON "PageUserAccess"
FOR EACH ROW EXECUTE FUNCTION "updateUserPageAccess"();


-- PageTeamAccess -> PageAccess
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
  ELSIF TG_OP = 'DELETE' OR NEW.role != OLD.role THEN
    SELECT ARRAY(SELECT "userId" FROM "TeamMember" WHERE "teamId" = OLD."teamId") INTO "_userIds";
    PERFORM "updatePageAccess"("_userIds", ARRAY["_pageId"]);
	END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE TRIGGER trg_team_page_access
AFTER INSERT OR UPDATE OR DELETE ON "PageTeamAccess"
FOR EACH ROW EXECUTE FUNCTION "updateTeamPageAccess"();


-- PageOrganizationAccess -> PageAccess
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
  ELSIF TG_OP = 'DELETE' OR NEW.role != OLD.role THEN
    SELECT ARRAY(SELECT "userId" FROM "OrganizationUser" WHERE "orgId" = OLD."orgId") INTO "_userIds";
    PERFORM "updatePageAccess"("_userIds", ARRAY["_pageId"]);
	END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE TRIGGER trg_org_page_access
AFTER INSERT OR UPDATE OR DELETE ON "PageOrganizationAccess"
FOR EACH ROW EXECUTE FUNCTION "updateOrganizationPageAccess"();


-- MOVE EXTERNAL ACCESS TO USER ACCESS ON SIGNUP
CREATE OR REPLACE FUNCTION "promoteExternalAccess"()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "PageUserAccess" ("pageId", "userId", "role")
  SELECT "pageId", NEW.id, "role"
  FROM "PageExternalAccess"
  WHERE "email" = NEW.email;
  DELETE FROM "PageExternalAccess"
  WHERE "email" = NEW.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE TRIGGER trg_promote_external_access
AFTER INSERT ON "User"
FOR EACH ROW EXECUTE FUNCTION "promoteExternalAccess"();


-- UPDATE Page.isPrivate when external is added/removed
CREATE OR REPLACE FUNCTION "updateExternalPageAccess"() RETURNS TRIGGER AS $$
BEGIN
  PERFORM "maybeMarkPrivate"(ARRAY[COALESCE(NEW."pageId", OLD."pageId")]);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE TRIGGER trg_external_page_access
AFTER INSERT OR DELETE ON "PageExternalAccess"
FOR EACH ROW EXECUTE FUNCTION "updateExternalPageAccess"();


-- HANDLE JOIN/LEAVE TEAM
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
      SELECT "pageId" INTO "_pageIds"
        FROM "PageTeamAccess"
        WHERE "teamId" = COALESCE(NEW."teamId", OLD."teamId");
      PERFORM "updatePageAccess"(ARRAY["_userId"], "_pageIds");
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE TRIGGER trg_team_member_update_team_page_access
AFTER INSERT OR UPDATE OF "isNotRemoved" OR DELETE ON "TeamMember"
FOR EACH ROW EXECUTE FUNCTION "updateTeamPageAccessByTeamMember"();


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
CREATE OR REPLACE TRIGGER trg_team_archived_remove_page_access
AFTER UPDATE OF "isArchived" ON "Team"
FOR EACH ROW
EXECUTE FUNCTION "removePageAccessOnTeamArchive"();


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
        PERFORM "updatePageAccess"(ARRAY["_userId"], ARRAY["_pageId"]);
      END LOOP;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE TRIGGER trg_org_user_update_org_page_access
AFTER INSERT OR UPDATE OF "removedAt" OR DELETE ON "OrganizationUser"
FOR EACH ROW EXECUTE FUNCTION "updateOrgPageAccessByOrgUser"();

CREATE OR REPLACE FUNCTION "addAccessOnNewPage"()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "PageUserAccess" ("pageId", "userId", "role")
  VALUES (NEW."id", NEW."userId", 'owner');
  IF NEW."parentPageId" IS NOT NULL THEN
    -- Upsert PageUserAccess
    INSERT INTO "PageUserAccess" ("pageId", "userId", "role")
    SELECT NEW.id, "userId", "role"
    FROM "PageUserAccess"
    WHERE "pageId" = NEW."parentPageId"
    AND "userId" != NEW."userId";

    -- Upsert PageTeamAccess
    INSERT INTO "PageTeamAccess" ("pageId", "teamId", "role")
    SELECT NEW.id, "teamId", "role"
    FROM "PageTeamAccess"
    WHERE "pageId" = NEW."parentPageId";

    -- Upsert PageOrganizationAccess
    INSERT INTO "PageOrganizationAccess" ("pageId", "orgId", "role")
    SELECT NEW.id, "orgId", "role"
    FROM "PageOrganizationAccess"
    WHERE "pageId" = NEW."parentPageId";

    -- Upsert PageExternalAccess
    INSERT INTO "PageExternalAccess" ("pageId", "email", "role")
    SELECT NEW.id, "email", "role"
    FROM "PageExternalAccess"
    WHERE "pageId" = NEW."parentPageId";
  ELSIF NEW."teamId" IS NOT NULL THEN
    INSERT INTO "PageTeamAccess" ("pageId", "teamId", "role")
    VALUES (NEW."id", NEW."teamId", 'editor');
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE TRIGGER trg_add_access_on_new_page
AFTER INSERT ON "Page"
FOR EACH ROW
EXECUTE FUNCTION "addAccessOnNewPage"();

--- REMOVE ACCESS ON DELETED PAGE
CREATE OR REPLACE FUNCTION "removeAccessOnDeletePage"()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM "PageUserAccess"
    WHERE "pageId" = OLD."pageId";
  DELETE FROM "PageExternalAccess"
    WHERE "pageId" = OLD."pageId";
  DELETE FROM "PageTeamAccess"
    WHERE "pageId" = OLD."pageId";
  DELETE FROM "PageOrganizationAccess"
    WHERE "pageId" = OLD."pageId";
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE TRIGGER trg_remove_access_on_del_page
AFTER DELETE ON "Page"
FOR EACH ROW
EXECUTE FUNCTION "removeAccessOnDeletePage"();

-- Fractional Indexing helper
CREATE OR REPLACE FUNCTION position_before(pos text)
RETURNS text AS $$
DECLARE
  i int;
  cur_char text;
  cur_code int;
  result text;
BEGIN
  FOR i IN reverse length(pos)..1 LOOP
    cur_char := substr(pos, i, 1);
    cur_code := ascii(cur_char);

    IF cur_code > 33 THEN  -- START_CHAR_CODE + 1
      RETURN substr(pos, 1, i - 1) || chr(cur_code - 1);
    END IF;
  END LOOP;

  -- fallback: shorten pos and append two chars
  result := substr(pos, 1, length(pos) - 1) || chr(32) || chr(126);
  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


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
CREATE OR REPLACE TRIGGER trg_page_shared_sort_order
AFTER UPDATE OF "teamId", "parentPageId", "isPrivate" ON "Page"
FOR EACH ROW
EXECUTE FUNCTION "addSharedPageSortOrder"();
`.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`
    DROP TABLE IF EXISTS "PageExternalAccess";
    DROP TABLE IF EXISTS "PageUserAccess";
    DROP TABLE IF EXISTS "PageTeamAccess";
    DROP TABLE IF EXISTS "PageOrganizationAccess";
    DROP TABLE IF EXISTS "PageAccess";
    DROP TABLE IF EXISTS "PageUserSortOrder";
    ALTER TABLE "Page"
      DROP COLUMN IF EXISTS "parentPageId" CASCADE,
      DROP COLUMN IF EXISTS "isParentLinked" CASCADE,
      DROP COLUMN IF EXISTS "teamId" CASCADE,
      DROP COLUMN IF EXISTS "isPrivate" CASCADE,
      DROP COLUMN IF EXISTS "sortOrder" CASCADE,
      DROP COLUMN IF EXISTS "ancestorIds" CASCADE;
    DROP TYPE IF EXISTS "PageRoleEnum" CASCADE;
    DROP TRIGGER IF EXISTS "trg_page_shared_sort_order" ON "Page";
    DROP TRIGGER IF EXISTS "trg_remove_access_on_del_page" ON "Page";
    DROP TRIGGER IF EXISTS "trg_add_access_on_new_page" ON "Page";
    DROP TRIGGER IF EXISTS "trg_promote_external_access" ON "User";
    DROP TRIGGER IF EXISTS "trg_team_member_update_team_page_access" ON "TeamMember";
    DROP TRIGGER IF EXISTS "trg_org_user_update_org_page_access" ON "OrganizationUser";
    DROP TRIGGER IF EXISTS "trg_team_archived_remove_page_access" ON "Team";
    DROP FUNCTION IF EXISTS "maybeMarkPrivate";
    DROP FUNCTION IF EXISTS "removeAccessOnDeletePage";
    DROP FUNCTION IF EXISTS "addAccessOnNewPage";
    DROP FUNCTION IF EXISTS "updatePageAccess";
    DROP FUNCTION IF EXISTS "updateUserPageAccess";
    DROP FUNCTION IF EXISTS "updateTeamPageAccess";
    DROP FUNCTION IF EXISTS "updateOrganizationPageAccess";
    DROP FUNCTION IF EXISTS "updateExternalPageAccess";
    DROP FUNCTION IF EXISTS "updateTeamPageAccessByTeamMember";
    DROP FUNCTION IF EXISTS "removePageAccessOnTeamArchive";
    DROP FUNCTION IF EXISTS "position_before";
    DROP FUNCTION IF EXISTS "addSharedPageSortOrder";
    DROP FUNCTION IF EXISTS "updateOrgPageAccessByOrgUser";`.execute(db)
  await db.schema.dropType('PageRoleEnum').ifExists().execute()
}
