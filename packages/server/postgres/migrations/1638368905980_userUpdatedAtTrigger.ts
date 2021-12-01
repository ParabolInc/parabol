import {ColumnDefinitions, MigrationBuilder} from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE OR REPLACE FUNCTION "set_updatedAt"()
    RETURNS TRIGGER LANGUAGE PLPGSQL AS $$
    BEGIN
      NEW."updatedAt" = now();
        RETURN NEW;
    END
    $$;
    CREATE TRIGGER "update_User_updatedAt" BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();
  `)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP TRIGGER "update_User_updatedAt" ON "User";
    DROP FUNCTION "set_updatedAt"();
  `)
}
