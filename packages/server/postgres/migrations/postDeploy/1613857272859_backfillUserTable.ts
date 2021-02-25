/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import getRethink from '../../../database/rethinkDriver'
import {backupUserQuery} from '../../queries/generated/backupUserQuery'
import catchAndLog from '../../utils/catchAndLog'
import getPg from '../../getPg'
import User from '../../../database/types/User'
import {IBackupUserQueryParams} from '../../queries/generated/backupUserQuery'
import getDeletedEmail from '../../../utils/getDeletedEmail'

const undefinedUserFieldsAndTheirDefaultPgValues = {
  newFeatureId: null,
  overLimitCopy: null,
  isRemoved: false,
  segmentId: null,
  reasonRemoved: null,
  rol: null,
  payLaterClickCount: 0,
  featureFlags: [],
  inactive: false
}

const mapUsers = (users: User[]): IBackupUserQueryParams['users'] => {
  const mappedUsers = [] as any
  users.forEach(user => {
    const mappedUser = Object.assign(
      {},
      undefinedUserFieldsAndTheirDefaultPgValues,
      user,
      {
        email: user.email === 'DELETED' ?
          getDeletedEmail(user.id)
          :
          user.email.slice(0, 500),
        preferredName: user.preferredName.slice(0, 100),
      }
    ) as IBackupUserQueryParams['users'][0]
    if ((mappedUser.email as string).length === 500) { return }
    mappedUsers.push(mappedUser)
  })
  return mappedUsers
}

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
      const pgUsers = mapUsers(rethinkUsers)
      await catchAndLog(() => backupUserQuery.run({users: pgUsers}, getPg()))
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
