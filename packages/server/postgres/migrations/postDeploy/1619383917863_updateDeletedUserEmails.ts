/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import updateUser from '../../queries/updateUser'

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  const result = await pgm.db.query(`
    SELECT ARRAY_AGG("id") FROM "User"
      WHERE "email" LIKE 'DELETED:%';
  `)
  const deletedUserIds = result.rows[0]['array_agg']
  await updateUser({email: 'DELETED'}, deletedUserIds)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
}
