import {ColumnDefinitions, MigrationBuilder} from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE "User"
    DROP CONSTRAINT IF EXISTS "User_email_key";
  `)
}

export async function down(): Promise<void> {
  // noop
}
