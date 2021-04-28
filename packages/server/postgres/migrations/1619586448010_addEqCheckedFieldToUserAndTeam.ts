/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE "User"
      ADD COLUMN "eqChecked" TIMESTAMPTZ NOT NULL DEFAULT '-infinity'::timestamptz;
  
    ALTER TABLE "Team"
      ADD COLUMN "eqChecked" TIMESTAMPTZ NOT NULL DEFAULT '-infinity'::timestamptz;
  
    CREATE INDEX IF NOT EXISTS "idx_User_eqChecked" ON "User"("eqChecked");
    CREATE INDEX IF NOT EXISTS "idx_Team_eqChecked" ON "User"("eqChecked");
  `)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.sql(`
    ALTER TABLE "User"
      DROP COLUMN "eqChecked";
  
    ALTER TABLE "Team"
      DROP COLUMN "eqChecked";
  `)
}
