import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await sql`
  -- move external access to UserAccess AND Access on signup
  CREATE OR REPLACE FUNCTION "promoteExternalAccess"()
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO "PageUserAccess" ("pageId", "userId", "role")
    SELECT "pageId", NEW.id, "role"
    FROM "PageExternalAccess"
    WHERE "email" = NEW.email;
    INSERT INTO "PageAccess" ("pageId", "userId", "role")
    SELECT "pageId", NEW.id, "role"
    FROM "PageExternalAccess"
    WHERE "email" = NEW.email;
    DELETE FROM "PageExternalAccess"
    WHERE "email" = NEW.email;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  `.execute(db)
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await sql`
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
  `.execute(db)
}
