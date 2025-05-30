import {sql, type Kysely} from 'kysely'

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
CREATE OR REPLACE FUNCTION "maybeMarkPrivate"("_pageId" INT)
RETURNS VOID AS $$
DECLARE
  "_willBePrivate" BOOLEAN;
BEGIN
  SELECT (
  (SELECT COUNT(*) = 1 FROM "PageUserAccess"         WHERE "pageId" = "_pageId" LIMIT 2) AND
  NOT EXISTS (SELECT 1 FROM "PageTeamAccess"         WHERE "pageId" = "_pageId" LIMIT 1) AND
  NOT EXISTS (SELECT 1 FROM "PageOrganizationAccess" WHERE "pageId" = "_pageId" LIMIT 1) AND
  NOT EXISTS (SELECT 1 FROM "PageExternalAccess"     WHERE "pageId" = "_pageId" LIMIT 1)
) INTO "_willBePrivate";
  UPDATE "Page"
  SET "isPrivate" = "_willBePrivate"
  WHERE id = "_pageId"
    AND "isPrivate" <> "_willBePrivate";
END;
$$ LANGUAGE plpgsql;


-- FUNCTION TO UPDATE CACHED TABLE
CREATE OR REPLACE FUNCTION "updatePageAccess"("_userId" VARCHAR, "_pageId" INT) RETURNS VOID AS $$
DECLARE
  "_strongestRole" "PageRoleEnum";
  "_currentRole" "PageRoleEnum";
BEGIN
  -- Find the strongest applicable role
  SELECT MIN(role)
  INTO "_strongestRole"
  FROM (
    SELECT pua.role FROM "PageUserAccess" pua
    WHERE pua."userId" = "_userId" AND pua."pageId" = "_pageId"
    UNION ALL
    SELECT pta.role
    FROM "PageTeamAccess" pta
    JOIN "TeamMember" tm ON pta."teamId" = tm."teamId"
    WHERE tm."userId" = "_userId" AND pta."pageId" = "_pageId"
    UNION ALL
    SELECT poa.role
    FROM "PageOrganizationAccess" poa
    JOIN "OrganizationUser" ou ON poa."orgId" = ou."orgId"
    WHERE ou."userId" = "_userId" AND poa."pageId" = "_pageId"
  ) AS effective_roles;

  -- Check existing effective role
  SELECT role INTO "_currentRole"
  FROM "PageAccess"
  WHERE "userId" = "_userId" AND "pageId" = "_pageId";

  IF "_strongestRole" IS NULL THEN
    -- User lost access
    DELETE FROM "PageAccess"
    WHERE "userId" = "_userId" AND "pageId" = "_pageId";
    PERFORM "maybeMarkPrivate"("_pageId");
  ELSIF "_currentRole" IS NULL THEN
    -- New access
    INSERT INTO "PageAccess" ("userId", "pageId", role)
    VALUES ("_userId", "_pageId", "_strongestRole");
    PERFORM "maybeMarkPrivate"("_pageId");
  ELSIF "_strongestRole" != "_currentRole" THEN
    -- Changed access
    UPDATE "PageAccess"
    SET role = "_strongestRole"
    WHERE "userId" = "_userId" AND "pageId" = "_pageId";
  END IF;
END;
$$ LANGUAGE plpgsql;


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
CREATE TRIGGER trg_promote_external_access
AFTER INSERT ON "User"
FOR EACH ROW EXECUTE FUNCTION "promoteExternalAccess"();


-- UPDATE CACHE FROM PageUserAccess
CREATE OR REPLACE FUNCTION "updateUserPageAccess"() RETURNS TRIGGER AS $$
BEGIN
  PERFORM "updatePageAccess"(
    COALESCE(NEW."userId", OLD."userId"),
    COALESCE(NEW."pageId", OLD."pageId")
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_user_page_access
AFTER INSERT OR UPDATE OR DELETE ON "PageUserAccess"
FOR EACH ROW EXECUTE FUNCTION "updateUserPageAccess"();


-- UPDATE CACHE FROM PageTeamAccess
CREATE OR REPLACE FUNCTION "updateTeamPageAccess"() RETURNS TRIGGER AS $$
DECLARE
  "_userId" VARCHAR;
  "_pageId" INT := COALESCE(NEW."pageId", OLD."pageId");
BEGIN
  FOR "_userId" IN SELECT "userId" FROM "TeamMember" WHERE "teamId" = COALESCE(NEW."teamId", OLD."teamId") LOOP
  PERFORM "updatePageAccess"("_userId", "_pageId");
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_team_page_access
AFTER INSERT OR UPDATE OR DELETE ON "PageTeamAccess"
FOR EACH ROW EXECUTE FUNCTION "updateTeamPageAccess"();


-- UPDATE CACHE FROM PageOrganizationAccess
CREATE OR REPLACE FUNCTION "updateOrganizationPageAccess"() RETURNS TRIGGER AS $$
DECLARE
  "_userId" VARCHAR;
  "_pageId" INT := COALESCE(NEW."pageId", OLD."pageId");
BEGIN
  FOR "_userId" IN SELECT "userId" FROM "OrganizationUser" WHERE "orgId" = COALESCE(NEW."orgId", OLD."orgId") LOOP
  PERFORM "updatePageAccess"("_userId", "_pageId");
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_org_page_access
AFTER INSERT OR UPDATE OR DELETE ON "PageOrganizationAccess"
FOR EACH ROW EXECUTE FUNCTION "updateOrganizationPageAccess"();

-- UPDATE Page.isPrivate when external is added/removed
CREATE OR REPLACE FUNCTION "updateExternalPageAccess"() RETURNS TRIGGER AS $$
BEGIN
  PERFORM "maybeMarkPrivate"(COALESCE(NEW."pageId", OLD."pageId"));
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_external_page_access
AFTER INSERT OR DELETE ON "PageExternalAccess"
FOR EACH ROW EXECUTE FUNCTION "updateExternalPageAccess"();


-- HANDLE JOIN/LEAVE TEAM
CREATE OR REPLACE FUNCTION "updateTeamPageAccessByTeamMember"() RETURNS TRIGGER AS $$
DECLARE
  "_pageId" INT;
  "_userId" VARCHAR := COALESCE(NEW."userId", OLD."userId");
BEGIN
  IF TG_OP != 'UPDATE' OR NEW."isNotRemoved" != OLD."isNotRemoved" THEN
    FOR "_pageId" IN
      SELECT "pageId"
      FROM "PageTeamAccess"
      WHERE "teamId" = COALESCE(NEW."teamId", OLD."teamId")
    LOOP
      PERFORM "updatePageAccess"("_userId", "_pageId");
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_team_member_update_team_page_access
AFTER INSERT OR UPDATE OF "isNotRemoved" OR DELETE ON "TeamMember"
FOR EACH ROW EXECUTE FUNCTION "updateTeamPageAccessByTeamMember"();


-- HANDLE ARCHIVE TEAM
CREATE OR REPLACE FUNCTION "removePageAccessOnTeamArchive"() RETURNS TRIGGER AS $$
BEGIN
  IF NEW."isArchived" = TRUE AND OLD."isArchived" != TRUE THEN
    DELETE FROM "PageTeamAccess"
    WHERE "teamId" = NEW."id";
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
    FOR "_pageId" IN
      SELECT "pageId"
      FROM "PageOrganizationAccess"
      WHERE "orgId" = COALESCE(NEW."orgId", OLD."orgId")
    LOOP
      PERFORM "updatePageAccess"("_userId", "_pageId");
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_org_user_update_org_page_access
AFTER INSERT OR UPDATE OF "removedAt" OR DELETE ON "OrganizationUser"
FOR EACH ROW EXECUTE FUNCTION "updateOrgPageAccessByOrgUser"();


--- UNLINK FROM PARENT WHEN MORE RESTRICTIVE
CREATE OR REPLACE FUNCTION "unlinkFromParentPage"()
RETURNS TRIGGER AS $$
DECLARE
  "_parentRole" "PageRoleEnum";
  "_parentPageId" INT;
  "_isParentLinked" BOOLEAN;
BEGIN
  -- Only proceed if the role was downgraded or deleted
  IF TG_OP = 'DELETE' OR OLD."role" < NEW."role" THEN
    SELECT "parentPageId", "isParentLinked" INTO "_parentPageId", "_isParentLinked"
      FROM "Page"
      WHERE "id" = OLD."pageId";

    -- Skip if no parent
    IF "_parentPageId" IS NULL OR "_isParentLinked" = FALSE THEN
      RETURN NULL;
    END IF;

    -- Fetch parent role based on access type
    IF TG_TABLE_NAME = 'PageUserAccess' THEN
      SELECT "role" INTO "_parentRole"
      FROM "PageUserAccess"
      WHERE "pageId" = "_parentPageId"
        AND "userId" = OLD."userId";

    ELSIF TG_TABLE_NAME = 'PageTeamAccess' THEN
      SELECT "role" INTO "_parentRole"
      FROM "PageTeamAccess"
      WHERE "pageId" = "_parentPageId"
        AND "teamId" = OLD."teamId";

    ELSIF TG_TABLE_NAME = 'PageOrganizationAccess' THEN
      SELECT "role" INTO "_parentRole"
      FROM "PageOrganizationAccess"
      WHERE "pageId" = "_parentPageId"
        AND "orgId" = OLD."orgId";

    ELSIF TG_TABLE_NAME = 'PageExternalAccess' THEN
      SELECT "role" INTO "_parentRole"
      FROM "PageExternalAccess"
      WHERE "pageId" = "_parentPageId"
        AND "email" = OLD."email";
    END IF;

    -- Unlink if the child role exceeds the parent's
    IF "_parentRole" IS NOT NULL AND (TG_OP = 'DELETE' OR "_parentRole" < NEW."role") THEN
      UPDATE "Page"
      SET "isParentLinked" = FALSE
      WHERE "id" = OLD."pageId";
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_unlink_on_restriction_user
AFTER UPDATE OR DELETE ON "PageUserAccess"
FOR EACH ROW
EXECUTE FUNCTION "unlinkFromParentPage"();

CREATE OR REPLACE TRIGGER trg_unlink_on_restriction_external
AFTER UPDATE OR DELETE ON "PageExternalAccess"
FOR EACH ROW
EXECUTE FUNCTION "unlinkFromParentPage"();

CREATE OR REPLACE TRIGGER trg_unlink_on_restriction_team
AFTER UPDATE OR DELETE ON "PageTeamAccess"
FOR EACH ROW
EXECUTE FUNCTION "unlinkFromParentPage"();

CREATE OR REPLACE TRIGGER trg_unlink_on_restriction_org
AFTER UPDATE OR DELETE ON "PageOrganizationAccess"
FOR EACH ROW
EXECUTE FUNCTION "unlinkFromParentPage"();

--- PROPAGATE USER ACCESS TO CHILDREN
CREATE OR REPLACE FUNCTION "propagateAccessToChildPagesUser"()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM "PageUserAccess"
    WHERE "pageId" IN (SELECT id FROM "Page" WHERE "parentPageId" = OLD."pageId" AND "isParentLinked" = TRUE)
    AND "userId" = OLD."userId";
  ELSE
    INSERT INTO "PageUserAccess" ("pageId", "userId", "role")
    SELECT id, NEW."userId", NEW."role"
    FROM (SELECT id FROM "Page" WHERE "parentPageId" = NEW."pageId" AND "isParentLinked" = TRUE)
    ON CONFLICT ("pageId", "userId") DO UPDATE
    SET "role" = EXCLUDED."role";
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_propagate_access_user
AFTER INSERT OR UPDATE OR DELETE ON "PageUserAccess"
FOR EACH ROW
EXECUTE FUNCTION "propagateAccessToChildPagesUser"();

--- PROPAGATE TEAM ACCESS TO CHILDREN
CREATE OR REPLACE FUNCTION "propagateAccessToChildPagesTeam"()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM "PageTeamAccess"
    WHERE "pageId" IN (SELECT id FROM "Page" WHERE "parentPageId" = OLD."pageId" AND "isParentLinked" = TRUE)
    AND "teamId" = OLD."teamId";
  ELSE
    INSERT INTO "PageTeamAccess" ("pageId", "teamId", "role")
    SELECT id, NEW."teamId", NEW."role"
    FROM (SELECT id FROM "Page" WHERE "parentPageId" = NEW."pageId" AND "isParentLinked" = TRUE)
    ON CONFLICT ("pageId", "teamId") DO UPDATE
    SET "role" = EXCLUDED."role";
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_propagate_access_team
AFTER INSERT OR UPDATE OR DELETE ON "PageTeamAccess"
FOR EACH ROW
EXECUTE FUNCTION "propagateAccessToChildPagesTeam"();

--- PROPAGATE EXTERNAL ACCESS TO CHILDREN
CREATE OR REPLACE FUNCTION "propagateAccessToChildPagesExternal"()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM "PageExternalAccess"
    WHERE "pageId" IN (SELECT id FROM "Page" WHERE "parentPageId" = OLD."pageId" AND "isParentLinked" = TRUE)
    AND "email" = OLD."email";
  ELSE
    INSERT INTO "PageExternalAccess" ("pageId", "email", "role")
    SELECT id, NEW."email", NEW."role"
    FROM (SELECT id FROM "Page" WHERE "parentPageId" = NEW."pageId" AND "isParentLinked" = TRUE)
    ON CONFLICT ("pageId", "email") DO UPDATE
    SET "role" = EXCLUDED."role";
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_propagate_access_external
AFTER INSERT OR UPDATE OR DELETE ON "PageExternalAccess"
FOR EACH ROW
EXECUTE FUNCTION "propagateAccessToChildPagesExternal"();

--- PROPAGATE ORG ACCESS TO CHILDREN
CREATE OR REPLACE FUNCTION "propagateAccessToChildPagesOrganization"()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM "PageOrganizationAccess"
    WHERE "pageId" IN (SELECT id FROM "Page" WHERE "parentPageId" = OLD."pageId" AND "isParentLinked" = TRUE)
    AND "orgId" = OLD."orgId";
  ELSE
    INSERT INTO "PageOrganizationAccess" ("pageId", "orgId", "role")
    SELECT id, NEW."orgId", NEW."role"
    FROM (SELECT id FROM "Page" WHERE "parentPageId" = NEW."pageId" AND "isParentLinked" = TRUE)
    ON CONFLICT ("pageId", "orgId") DO UPDATE
    SET "role" = EXCLUDED."role";
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_propagate_access_org
AFTER INSERT OR UPDATE OR DELETE ON "PageOrganizationAccess"
FOR EACH ROW
EXECUTE FUNCTION "propagateAccessToChildPagesOrganization"();


--- ADD ACCESS ON NEW PAGE
CREATE OR REPLACE FUNCTION "cloneParentAccess"("_parentPageId" INT, "_pageId" INT)
RETURNS VOID AS $$
BEGIN
  -- Upsert PageUserAccess
  INSERT INTO "PageUserAccess" ("pageId", "userId", "role")
  SELECT "_pageId", "userId", "role"
  FROM "PageUserAccess"
  WHERE "pageId" = "_parentPageId"
  ON CONFLICT ("pageId", "userId") DO UPDATE
  SET "role" = EXCLUDED."role";

  -- Upsert PageTeamAccess
  INSERT INTO "PageTeamAccess" ("pageId", "teamId", "role")
  SELECT "_pageId", "teamId", "role"
  FROM "PageTeamAccess"
  WHERE "pageId" = "_parentPageId"
  ON CONFLICT ("pageId", "teamId") DO UPDATE
  SET "role" = EXCLUDED."role";

  -- Upsert PageOrganizationAccess
  INSERT INTO "PageOrganizationAccess" ("pageId", "orgId", "role")
  SELECT "_pageId", "orgId", "role"
  FROM "PageOrganizationAccess"
  WHERE "pageId" = "_parentPageId"
  ON CONFLICT ("pageId", "orgId") DO UPDATE
  SET "role" = EXCLUDED."role";

  -- Upsert PageExternalAccess
  INSERT INTO "PageExternalAccess" ("pageId", "email", "role")
  SELECT "_pageId", "email", "role"
  FROM "PageExternalAccess"
  WHERE "pageId" = "_parentPageId"
  ON CONFLICT ("pageId", "email") DO UPDATE
  SET "role" = EXCLUDED."role";
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION "addAccessOnNewPage"()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "PageUserAccess" ("pageId", "userId", "role")
  VALUES (NEW."id", NEW."userId", 'owner');
  IF NEW."parentPageId" IS NOT NULL THEN
    PERFORM "cloneParentAccess"(NEW."parentPageId", NEW.id);
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


CREATE OR REPLACE FUNCTION "revokeAccess"("_pageId" INT)
RETURNS VOID AS $$
BEGIN
  DELETE FROM "PageUserAccess"
    WHERE "pageId" = "_pageId";
  DELETE FROM "PageExternalAccess"
    WHERE "pageId" = "_pageId";
  DELETE FROM "PageTeamAccess"
    WHERE "pageId" = "_pageId";
  DELETE FROM "PageOrganizationAccess"
    WHERE "pageId" = "_pageId";
END;
$$ LANGUAGE plpgsql;

--- REMOVE ACCESS ON DELETED PAGE
CREATE OR REPLACE FUNCTION "removeAccessOnDeletePage"()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM "revokeAccess"(OLD."pageId");
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
  "_userId" VARCHAR;
BEGIN
  IF "_wasShared" != "_isShared" THEN
    IF "_isShared" THEN
      FOR "_userId" IN
        SELECT "userId"
        FROM "PageAccess"
        WHERE "pageId" = NEW."id"
      LOOP
        INSERT INTO "PageUserSortOrder" ("userId", "pageId", "sortOrder")
        VALUES (
          "_userId",
          NEW.id,
          position_before(
            COALESCE(
              (SELECT "sortOrder"
              FROM "PageUserSortOrder"
              WHERE "userId" = "_userId"
              ORDER BY "sortOrder"
              LIMIT 1),
              ' '
            )
          )
        );
      END LOOP;
    ELSE
      DELETE FROM "PageUserSortOrder" WHERE "pageId" = NEW.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_page_shared_sort_order
AFTER UPDATE OF "teamId", "parentPageId", "isPrivate" ON "Page"
FOR EACH ROW
EXECUTE FUNCTION "addSharedPageSortOrder"();


-- Update access on changed parent
CREATE OR REPLACE FUNCTION "handlePageHierarchyChange"()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if teamId or parentPageId changed
  IF NEW."isParentLinked" = TRUE AND OLD."isParentLinked" = FALSE THEN
    IF NEW."teamId" IS NOT NULL THEN
      -- Make the whole new team at least an editor
      INSERT INTO "PageTeamAccess" ("pageId", "teamId", "role")
      VALUES (NEW.id, NEW."teamId", 'editor')
      ON CONFLICT ("pageId", "teamId") DO UPDATE
      SET "role" = LEAST(EXCLUDED."role", 'editor');
    ELSIF NEW."parentPageId" IS NOT NULL THEN
      PERFORM "cloneParentAccess"(NEW."parentPageId", NEW.id);
    END IF;
  ELSIF (NEW."parentPageId" IS NOT NULL OR NEW."teamId" IS NOT NULL) AND (NEW."parentPageId" IS DISTINCT FROM OLD."parentPageId" OR NEW."teamId" IS DISTINCT FROM OLD."teamId") THEN
    -- get rid of all old access unless it was a child of a shared page
    PERFORM "revokeAccess"(NEW.id);
    IF NEW."parentPageId" IS NOT NULL THEN
      PERFORM "cloneParentAccess"(NEW."parentPageId", NEW.id);
    ELSE
      INSERT INTO "PageTeamAccess" ("pageId", "teamId", "role")
      VALUES (NEW.id, NEW."teamId", 'editor')
      ON CONFLICT ("pageId", "teamId") DO UPDATE
      SET "role" = LEAST(EXCLUDED."role", 'editor');
    END IF;
    IF NEW."isParentLinked" = FALSE THEN
      UPDATE "Page" SET "isParentLinked" = TRUE WHERE id = NEW.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE TRIGGER trg_handle_page_hierarchy_change
AFTER UPDATE OF "teamId", "parentPageId", "isParentLinked" ON "Page"
FOR EACH ROW
EXECUTE FUNCTION "handlePageHierarchyChange"();


-- Ensure parentPageId does not create a circular ref
CREATE OR REPLACE FUNCTION "preventCircularParent"()
RETURNS TRIGGER AS $$
DECLARE
  foundLoop BOOLEAN;
BEGIN
  -- If the parentPageId isn't changing, no need to check
  IF NEW."parentPageId" IS NULL OR NEW."parentPageId" = OLD."parentPageId" THEN
    RETURN NEW;
  END IF;

  -- Recursive CTE to walk up the tree from the new parent
  WITH RECURSIVE ancestors AS (
    SELECT "id", "parentPageId"
    FROM "Page"
    WHERE "id" = NEW."parentPageId"

    UNION ALL

    SELECT p."id", p."parentPageId"
    FROM "Page" p
    INNER JOIN ancestors a ON a."parentPageId" = p."id"
  )
  SELECT TRUE INTO foundLoop
  FROM ancestors
  WHERE "id" = NEW."id" -- Cycle detected
  LIMIT 1;

  IF foundLoop THEN
    RAISE EXCEPTION 'Circular parentPageId detected: cannot set % as a parent of %', NEW."parentPageId", NEW."id";
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_page_prevent_circular_parent
BEFORE UPDATE OF "parentPageId" ON "Page"
FOR EACH ROW
EXECUTE FUNCTION "preventCircularParent"();
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
      DROP COLUMN IF EXISTS "sortOrder" CASCADE;
    DROP TYPE IF EXISTS "PageRoleEnum" CASCADE;
    DROP TRIGGER IF EXISTS "trg_page_prevent_circular_parent" ON "Page";
    DROP TRIGGER IF EXISTS "trg_handle_page_hierarchy_change" ON "Page";
    DROP TRIGGER IF EXISTS "trg_page_shared_sort_order" ON "Page";
    DROP TRIGGER IF EXISTS "trg_remove_access_on_del_page" ON "Page";
    DROP TRIGGER IF EXISTS "trg_add_access_on_new_page" ON "Page";
    DROP TRIGGER IF EXISTS "trg_promote_external_access" ON "User";
    DROP TRIGGER IF EXISTS "trg_team_member_update_team_page_access" ON "TeamMember";
    DROP TRIGGER IF EXISTS "trg_org_user_update_org_page_access" ON "OrganizationUser";
    DROP TRIGGER IF EXISTS "trg_team_archived_remove_page_access" ON "Team";
    DROP FUNCTION IF EXISTS "preventCircularParent";
    DROP FUNCTION IF EXISTS "revokeAccess";
    DROP FUNCTION IF EXISTS "cloneParentAccess";
    DROP FUNCTION IF EXISTS "handlePageHierarchyChange";
    DROP FUNCTION IF EXISTS "maybeMarkPrivate";
    DROP FUNCTION IF EXISTS "removeAccessOnDeletePage";
    DROP FUNCTION IF EXISTS "unlinkFromParentPage";
    DROP FUNCTION IF EXISTS "addAccessOnNewPage";
    DROP FUNCTION IF EXISTS "propagateAccessToChildPagesExternal";
    DROP FUNCTION IF EXISTS "propagateAccessToChildPagesUser";
    DROP FUNCTION IF EXISTS "propagateAccessToChildPagesTeam";
    DROP FUNCTION IF EXISTS "propagateAccessToChildPagesOrganization";
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
