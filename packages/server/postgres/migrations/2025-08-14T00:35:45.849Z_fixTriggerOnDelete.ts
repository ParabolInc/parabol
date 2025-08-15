import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
--- REMOVE ACCESS ON DELETED PAGE
CREATE OR REPLACE FUNCTION "removeAccessOnDeletePage"()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM "PageUserAccess"
    WHERE "pageId" = OLD.id;
  DELETE FROM "PageExternalAccess"
    WHERE "pageId" = OLD.id;
  DELETE FROM "PageTeamAccess"
    WHERE "pageId" = OLD.id;
  DELETE FROM "PageOrganizationAccess"
    WHERE "pageId" = OLD.id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
`.execute(db)
}
export async function down(db: Kysely<any>): Promise<void> {
  // noop
}
