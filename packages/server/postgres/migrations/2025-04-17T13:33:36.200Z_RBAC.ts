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
      .createTable('PageGuestAccess')
      .addColumn('pageId', 'serial', (col) =>
        col.references('Page.id').onDelete('cascade').notNull()
      )
      // if email is * then the page is public
      .addColumn('email', 'citext', (col) => col.notNull())
      .addColumn('role', sql`"PageRoleEnum"`, (col) => col.notNull())
      .addPrimaryKeyConstraint('PageGuestAccess_pk', ['pageId', 'email'])
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
      .execute()
  ])

  await Promise.all([
    db.schema
      .createIndex('idx_PageGuestAccess_email')
      .on('PageGuestAccess')
      .column('email')
      .execute(),
    db.schema
      .createIndex('idx_PageGuestAccess_pageId')
      .on('PageGuestAccess')
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
    db.schema.createIndex('idx_PageAccess_userId').on('PageAccess').column('userId').execute()
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


-- MOVE GUEST ACCESS TO USER ACCESS ON SIGNUP
CREATE OR REPLACE FUNCTION "promoteGuestAccess"()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "PageUserAccess" ("pageId", "userId", "role")
  SELECT "pageId", NEW.id, "role"
  FROM "PageGuestAccess"
  WHERE "email" = NEW.email;

  DELETE FROM "PageGuestAccess"
  WHERE "email" = NEW.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_promote_guest_access
AFTER INSERT ON "User"
FOR EACH ROW EXECUTE FUNCTION "promoteGuestAccess"();


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
  "_userId" INT := COALESCE(NEW."userId", OLD."userId");
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
`.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await Promise.all([
    db.schema.dropTable('PageUserAccess').ifExists().execute(),
    db.schema.dropTable('PageTeamAccess').ifExists().execute(),
    db.schema.dropTable('PageOrganizationAccess').ifExists().execute(),
    db.schema.dropTable('PageAccess').ifExists().execute()
  ])
  await sql`
    DROP TRIGGER IF EXISTS "updatePageAccess";
    DROP TRIGGER IF EXISTS "updateUserPageAccess";
    DROP TRIGGER IF EXISTS "updateTeamPageAccess";
    DROP TRIGGER IF EXISTS "updateOrganizationPageAccess";
    DROP TRIGGER IF EXISTS "updateTeamPageAccessByTeamMember";
    DROP TRIGGER IF EXISTS "removePageAccessOnTeamArchive";
    DROP TRIGGER IF EXISTS "updateOrgPageAccessByOrgUser";
  `.execute(db)
  await db.schema.dropType('PageRoleEnum').ifExists().execute()
}
