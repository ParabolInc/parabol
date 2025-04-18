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
  "strongestRole" "PageRoleEnum";
  "currentRole" "PageRoleEnum";
BEGIN
  -- Find the strongest applicable role
  SELECT MIN(role)
  INTO "strongestRole"
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
  SELECT role INTO "currentRole"
  FROM "PageAccess"
  WHERE "userId" = "_userId" AND "pageId" = "_pageId";

  IF "strongestRole" IS NULL THEN
    -- User lost access
    DELETE FROM "PageAccess"
    WHERE "userId" = "_userId" AND "pageId" = "_pageId";
  ELSIF "currentRole" IS NULL THEN
    -- New access
    INSERT INTO "PageAccess" ("userId", "pageId", role)
    VALUES ("_userId", "_pageId", "strongestRole");
  ELSIF "strongestRole" <> "currentRole" THEN
    -- Changed access
    UPDATE "PageAccess"
    SET role = "strongestRole"
    WHERE "userId" = "_userId" AND "pageId" = "_pageId";
  END IF;
END;
$$ LANGUAGE plpgsql;


-- UPDATE CACHE FROM PageUserAccess
CREATE OR REPLACE FUNCTION "updateUserPageAccess"() RETURNS TRIGGER AS $$
BEGIN
  PERFORM "updatePageAccess"(NEW."userId", NEW."pageId");
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_user_page_access
AFTER INSERT OR UPDATE OR DELETE ON "PageUserAccess"
FOR EACH ROW EXECUTE FUNCTION "updateUserPageAccess"();


-- UPDATE CACHE FROM PageTeamAccess
CREATE OR REPLACE FUNCTION "updateTeamPageAccess"() RETURNS TRIGGER AS $$
DECLARE
  "_userId" VARCHAR;
BEGIN
  FOR "_userId" IN SELECT "userId" FROM "TeamMember" WHERE "teamId" = NEW."teamId" LOOP
  PERFORM "updatePageAccess"("_userId", NEW."pageId");
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
BEGIN
  FOR "_userId" IN SELECT "userId" FROM "OrganizationUser" WHERE "orgId" = NEW."orgId" LOOP
  PERFORM "updatePageAccess"("_userId", NEW."pageId");
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
BEGIN
  IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND NEW."isNotRemoved" != OLD."isNotRemoved") THEN
    FOR "_pageId" IN SELECT "pageId" FROM "PageTeamAccess" WHERE "teamId" = NEW."teamId" LOOP
      PERFORM "updatePageAccess"(NEW."userId", "_pageId");
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_team_member_update_team_page_access
AFTER INSERT OR UPDATE ON "TeamMember"
FOR EACH ROW EXECUTE FUNCTION "updateTeamPageAccessByTeamMember"();


-- HANDLE ARCHIVE TEAM
CREATE OR REPLACE FUNCTION "removePageAccessOnTeamArchive"() RETURNS TRIGGER AS $$
BEGIN
  IF NEW."isArchived" = TRUE AND (OLD."isArchived" != TRUE) THEN
    DELETE FROM "PageTeamAccess"
    WHERE "teamId" = NEW."id";
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_team_archived_remove_page_access
AFTER UPDATE ON "Team"
FOR EACH ROW
EXECUTE FUNCTION "removePageAccessOnTeamArchive"();


-- HANDLE JOIN/LEAVE ORG
CREATE OR REPLACE FUNCTION "updateOrgPageAccessByOrgUser"() RETURNS TRIGGER AS $$
DECLARE
  "_pageId" INT;
BEGIN
  IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND NEW."removedAt" IS DISTINCT FROM OLD."removedAt") THEN
    FOR "_pageId" IN SELECT "pageId" FROM "PageOrganizationAccess" WHERE "orgId" = NEW."orgId" LOOP
      PERFORM "updatePageAccess"(NEW."userId", "_pageId");
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_org_user_update_org_page_access
AFTER INSERT OR UPDATE ON "OrganizationUser"
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
  await db.schema.dropType('PageRoleEnum').ifExists().execute()
}
