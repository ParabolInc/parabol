import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('Page')
    .addColumn('deletedAt', 'timestamptz')
    .addColumn('deletedBy', 'varchar(100)', (col) => col.references('User.id').onDelete('cascade'))
    .execute()

  await db.schema
    .createIndex('idx_pages_deletedBy_deletedAt')
    .on('Page')
    .column('deletedBy')
    .column('deletedAt desc')
    .where('deletedBy', 'is not', null)
    .execute()

  await sql`
CREATE OR REPLACE FUNCTION "handleCascadeDeletePage"()
RETURNS TRIGGER AS $$
BEGIN
	IF NEW."deletedAt" IS NOT NULL AND OLD."deletedAt" IS NULL THEN
		UPDATE "Page" SET
			"deletedAt" = NEW."deletedAt",
			"deletedBy" = NEW."deletedBy"
		WHERE "parentPageId" = NEW.id;
	END IF;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_delete_child_pages_on_del
AFTER UPDATE OF "deletedAt" ON "Page"
FOR EACH ROW
EXECUTE FUNCTION "handleCascadeDeletePage"();
		`.execute(db)
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await sql`
	DROP TRIGGER IF EXISTS trg_delete_child_pages_on_del on "Page";
	DROP FUNCTION IF EXISTS "handleCascadeDeletePage";
	`.execute(db)
  await db.schema.alterTable('Page').dropColumn('deletedAt').dropColumn('deletedBy').execute()
}
