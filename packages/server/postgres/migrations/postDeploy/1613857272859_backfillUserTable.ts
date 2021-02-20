/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import getRethink from '../../../database/rethinkDriver'

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  const r = await getRethink()
  const batchSize = 1
  let i = 0

  while (true) {
    const offset = batchSize * i
    const users = await r
      .table('User')
      .orderBy('createdAt')
      .skip(offset)
      .limit(batchSize)
      .run()
    if (!users.length) { break }
    i += 1
  }
  await r.getPoolMaster().drain()
}

export async function down(pgm: MigrationBuilder): Promise<void> {
}
