import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('Page')
    .addColumn('isSyncedBlock', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute()
  await db.schema
    .alterTable('PageBacklink')
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()
  await sql`
CREATE OR REPLACE FUNCTION "handleCascadeDeletePage"()
RETURNS TRIGGER AS $$
BEGIN
	IF NEW."deletedAt" IS NOT NULL AND OLD."deletedAt" IS NULL THEN
		UPDATE "Page" SET
			"deletedAt" = NEW."deletedAt",
			"deletedBy" = NEW."deletedBy"
		WHERE "parentPageId" = NEW.id AND "isSyncedBlock" = false;
	END IF;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;
  `.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
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
  `.execute(db)
  await db.schema.alterTable('PageBacklink').dropColumn('createdAt').execute()
  await db.schema.alterTable('Page').dropColumn('isSyncedBlock').execute()
}
