import {ColumnDefinitions, MigrationBuilder} from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
     UPDATE "User"
       SET "email" = CONCAT_WS(':', 'DELETED', "id", TRUNC((extract(epoch from now())*1000)))
       WHERE "email" = 'DELETED';
   `)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
     UPDATE "User"
       SET "email" = 'DELETED'
       WHERE "email" LIKE 'DELETED:%';
   `)
}
