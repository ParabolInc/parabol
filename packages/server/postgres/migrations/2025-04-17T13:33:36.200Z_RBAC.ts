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
      .alterTable('Page')
      .addColumn('parentPageId', 'integer', (col) => col.references('Page.id').onDelete('cascade'))
      .addColumn('isParentLinked', 'boolean', (col) => col.defaultTo(true))
      .addColumn('teamId', 'varchar(100)', (col) => col.references('Team.id').onDelete('cascade'))
      .execute()
  ])

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
    db.schema.createIndex('idx_Page_parentPageId').on('Page').column('parentPageId').execute(),
    db.schema
      .createIndex('idx_Page_teamId')
      .on('Page')
      .column('teamId')
      .where('teamId', 'is not', null)
      .execute()
  ])

  await sql`
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
  ELSIF "_currentRole" IS NULL THEN
    -- New access
    INSERT INTO "PageAccess" ("userId", "pageId", role)
    VALUES ("_userId", "_pageId", "_strongestRole");
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
BEGIN
  IF TG_OP = 'DELETE' OR OLD.role > NEW.role THEN
    UPDATE "Page"
    SET "isParentLinked" = FALSE
    WHERE "id" = COALESCE(OLD."pageId", NEW."pageId")
    AND "parentPageId" IS NOT NULL;
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
CREATE OR REPLACE FUNCTION "addAccessOnNewPage"()
RETURNS TRIGGER AS $$
BEGIN
INSERT INTO "PageUserAccess" ("pageId", "userId", "role")
VALUES (NEW."id", NEW."userId", 'owner');
IF NEW."parentPageId" IS NOT NULL THEN
  -- Copy PageUserAccess
  INSERT INTO "PageUserAccess" ("pageId", "userId", "role")
  SELECT NEW."id", "userId", "role"
  FROM "PageUserAccess"
  WHERE "pageId" = NEW."parentPageId";

  -- Copy PageExternalAccess
  INSERT INTO "PageExternalAccess" ("pageId", "email", "role")
  SELECT NEW."id", "email", "role"
  FROM "PageExternalAccess"
  WHERE "pageId" = NEW."parentPageId";

  -- Copy PageTeamAccess
  INSERT INTO "PageTeamAccess" ("pageId", "teamId", "role")
  SELECT NEW."id", "teamId", "role"
  FROM "PageTeamAccess"
  WHERE "pageId" = NEW."parentPageId";

  -- Copy PageOrganizationAccess
  INSERT INTO "PageOrganizationAccess" ("pageId", "orgId", "role")
  SELECT NEW."id", "orgId", "role"
  FROM "PageOrganizationAccess"
  WHERE "pageId" = NEW."parentPageId";
ELSIF NEW."teamId" IS NOT NULL THEN
  INSERT INTO "PageTeamAccess" ("pageId", "teamId", "role")
  VALUES (NEW."id", NEW."teamId", 'editor');
END IF;
RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_add_access_on_new_page
AFTER INSERT ON "Page"
FOR EACH ROW
EXECUTE FUNCTION "addAccessOnNewPage"();
`.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await Promise.all([
    db.schema.dropTable('PageExternalAccess').ifExists().execute(),
    db.schema.dropTable('PageUserAccess').ifExists().execute(),
    db.schema.dropTable('PageTeamAccess').ifExists().execute(),
    db.schema.dropTable('PageOrganizationAccess').ifExists().execute(),
    db.schema.dropTable('PageAccess').ifExists().execute(),
    db.schema
      .alterTable('Page')
      .dropColumn('parentPageId')
      .dropColumn('isParentLinked')
      .dropColumn('teamId')
      .execute()
  ])
  await sql`
    DROP TRIGGER IF EXISTS "trg_add_access_on_new_page" ON "Page";
    DROP TRIGGER IF EXISTS "trg_promote_external_access" ON "User";
    DROP TRIGGER IF EXISTS "trg_team_member_update_team_page_access" ON "TeamMember";
    DROP TRIGGER IF EXISTS "trg_org_user_update_org_page_access" ON "OrganizationUser";
    DROP TRIGGER IF EXISTS "trg_team_archived_remove_page_access" ON "Team";
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
    DROP FUNCTION IF EXISTS "updateTeamPageAccessByTeamMember";
    DROP FUNCTION IF EXISTS "removePageAccessOnTeamArchive";
    DROP FUNCTION IF EXISTS "updateOrgPageAccessByOrgUser";`.execute(db)
  await db.schema.dropType('PageRoleEnum').ifExists().execute()
}
