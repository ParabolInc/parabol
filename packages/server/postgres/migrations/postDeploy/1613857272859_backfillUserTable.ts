/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import getRethink from '../../../database/rethinkDriver'
import {backupUserQuery} from '../../../postgres/queries/generated/backupUserQuery'
import getPg from '../../../postgres/getPg'
import mapUsers from '../../mappers/mapUsers'

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  const r = await getRethink()
  const batchSize = 1
  let lastStartTs

  const doBackfill = async () => {
    lastStartTs = lastStartTs ?? r.minval
    const startTs = new Date()
    let i = 0
    let foundUsers = false

    while (true) {
      const offset = batchSize * i
      const rethinkUsers = await r
        .table('User')
        .orderBy('createdAt')
        .filter(row => row('createdAt').gt(lastStartTs))
        .skip(offset)
        .limit(batchSize)
        .run()
      if (!rethinkUsers.length) { break }
      foundUsers = true
      const pgUsers = mapUsers(rethinkUsers)
      backupUserQuery.run({users: pgUsers}, getPg())
      i += 1
    }
    lastStartTs = startTs
    return foundUsers
  }

  while (true) {
    const backfillFoundUsers = await doBackfill()
    if (!backfillFoundUsers) { break }
  }
  await r.getPoolMaster().drain()
}
