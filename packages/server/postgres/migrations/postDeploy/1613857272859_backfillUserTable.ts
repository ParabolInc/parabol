/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import getRethink from '../../../database/rethinkDriver'
import insertUser from '../../helpers/insertUser'

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  const r = await getRethink()
  const batchSize = 1
  let lastStartTs

  const doBackfill = async () => {
    lastStartTs = lastStartTs ?? r.minval
    const startTs = new Date()
    // todo: sleep long enough to manually insert another user in
    let i = 0
    let foundUsers = false
    // todo: need to clean up rethink users with email DELETED
    // todo: check for duplicate values for id or email in rethink users

    // todo: should also account for update race conditions??
    // maybe the backup should do on conflict update then??
    // console.log('starting backfill pass...')
    // console.log('last start ts:', lastStartTs)
    // console.log('start ts:', startTs)
    while (true) {
      console.log('i:', i)
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
      await insertUser(rethinkUsers)
      i += 1
    }
    lastStartTs = startTs
    // todo: another loop for race conditions updates???
    return foundUsers
  }

  while (true) {
    const backfillFoundUsers = await doBackfill()
    console.log('backfillFoundUsers?', backfillFoundUsers)
    // await new Promise(resolve => setTimeout(resolve, 1000*60*2))
    if (!backfillFoundUsers) { break }
  }
  console.log('finished')
  await r.getPoolMaster().drain()
}
