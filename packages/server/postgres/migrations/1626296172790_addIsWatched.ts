import {ColumnDefinitions, MigrationBuilder} from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
  ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "isWatched" BOOLEAN DEFAULT FALSE NOT NULL
`)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
  ALTER TABLE "User"
  DROP COLUMN "isWatched";
`)
}
