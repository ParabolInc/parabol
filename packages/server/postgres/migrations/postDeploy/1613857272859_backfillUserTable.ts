/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import getRethink from '../../../database/rethinkDriver'
import insertUser from '../../helpers/insertUser'
import catchAndLog from '../../utils/catchAndLog'

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  const r = await getRethink()
  const batchSize = 3000
  const backfillStartTs = new Date()
  console.log('start ts:', backfillStartTs)

  const doBackfill = async (
    usersByFieldChoice: ('createdAt' | 'updatedAt'),
    usersAfterTs?: Date
  ) => {
    let i = 0
    let foundUsers = false

    console.log('starting backfill pass...')
    console.log('after ts:', usersAfterTs, 'by:', usersByFieldChoice)
    while (true) {
      console.log('i:', i)
      const offset = batchSize * i
      const rethinkUsers = await r
        .db('actionProduction')
        .table('User')
        .between(usersAfterTs ?? r.minval, r.maxval, {index: usersByFieldChoice})
        .orderBy(usersByFieldChoice, {index: usersByFieldChoice})
        .skip(offset)
        .limit(batchSize)
        .run()
      if (!rethinkUsers.length) { break }
      foundUsers = true
      // todo: bring back backupUserQuery, as it's not the same as insert
      await catchAndLog(() => insertUser(rethinkUsers))
      i += 1
    }
    return foundUsers
  }

  const doBackfillAccountingForRaceConditions = async (
    usersByFieldChoice: ('createdAt' | 'updatedAt'),
    usersAfterTs?: Date
  ) => {
    while (true) {
      const thisBackfillStartTs = new Date()
      const backfillFoundUsers = await doBackfill(
        usersByFieldChoice,
        usersAfterTs
      )
      console.log('backfillFoundUsers?', backfillFoundUsers)
      // await new Promise(resolve => setTimeout(resolve, 1000*60*2)) // update user while sleeping
      if (!backfillFoundUsers) { break }
      usersAfterTs = thisBackfillStartTs
    }
  }

  await doBackfillAccountingForRaceConditions('createdAt')
  await doBackfillAccountingForRaceConditions('updatedAt', backfillStartTs)
  await r.getPoolMaster().drain()
  console.log('finished')
}
