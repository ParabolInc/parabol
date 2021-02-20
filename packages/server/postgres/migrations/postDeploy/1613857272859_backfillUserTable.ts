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
  let i = 0
  
  while (true) {
    const offset = batchSize * i
    const rethinkUsers = await r
      .table('User')
      .orderBy('createdAt')
      .skip(offset)
      .limit(batchSize)
      .run()
    if (!rethinkUsers.length) { break }
    const pgUsers = mapUsers(rethinkUsers)
    backupUserQuery.run({users: pgUsers}, getPg())
    i += 1
  }
  await r.getPoolMaster().drain()
}
