import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
	DROP TRIGGER IF EXISTS "trg_page_shared_sort_order" ON "Page";
	DROP FUNCTION IF EXISTS "addSharedPageSortOrder";

	CREATE OR REPLACE FUNCTION "removePageUserSortOrder"()
	RETURNS TRIGGER AS $$
		BEGIN
			DELETE FROM "PageUserSortOrder"
      WHERE "pageId" = OLD."pageId"
			AND "userId" = OLD."userId";
			RETURN NULL;
		END;
	$$ LANGUAGE plpgsql;

	CREATE OR REPLACE TRIGGER trg_delete_page_user_sort
	AFTER DELETE ON "PageAccess"
	FOR EACH ROW EXECUTE FUNCTION "removePageUserSortOrder"();
	`.execute(db)
  await db.schema
    .alterTable('PageUserSortOrder')
    .alterColumn('sortOrder', (ac) => ac.setNotNull())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  // this trigger function is broken it doesn't generate a sortOrder for all shared pages
  await sql`
	DROP TRIGGER IF EXISTS trg_delete_page_user_sort;
	DROP FUNCTION IF EXISTS "removePageUserSortOrder";
	`.execute(db)
  await db.schema
    .alterTable('PageUserSortOrder')
    .alterColumn('sortOrder', (ac) => ac.dropNotNull())
    .execute()
}
