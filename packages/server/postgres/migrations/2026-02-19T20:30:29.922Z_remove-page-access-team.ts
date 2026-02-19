import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await sql`
CREATE OR REPLACE FUNCTION "removePageAccessOnTeamArchive"() RETURNS TRIGGER AS $$
DECLARE
  "_pageIds" INT[];
  "_userIds" VARCHAR[];
BEGIN
  -- 1. Only run if isArchived flipped from False to True
  IF NEW."isArchived" = TRUE AND OLD."isArchived" = FALSE THEN

    WITH "deleted" AS (
      DELETE FROM "PageTeamAccess"
      WHERE "teamId" = NEW."id"
      RETURNING "pageId"
    )
    SELECT ARRAY(SELECT "pageId" FROM "deleted") INTO "_pageIds";

    "_userIds" := ARRAY(
      SELECT "userId" FROM "TeamMember" WHERE "teamId" = NEW."id"
    );

    -- 3. Only perform the update if there is actually work to do
    -- This prevents passing empty/null arrays to your sub-function
    IF array_length("_pageIds", 1) > 0 AND array_length("_userIds", 1) > 0 THEN
      PERFORM "updatePageAccess"("_userIds", "_pageIds");
    END IF;

  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
	`.execute(db)
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  // down migration code goes here...
  // note: down migrations are optional. you can safely delete this function.
  // For more info, see: https://kysely.dev/docs/migrations
}
