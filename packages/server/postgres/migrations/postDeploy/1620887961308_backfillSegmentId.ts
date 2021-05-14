import {ColumnDefinitions} from 'node-pg-migrate'
import getRethink from '../../../database/rethinkDriver'
import getPg from '../../getPg'
import {backfillSegmentIdQuery} from '../../queries/generated/backfillSegmentIdQuery'
import catchAndLog from '../../utils/catchAndLog'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(): Promise<void> {
  const r = await getRethink()
  const batchSize = 3000
  const doBackfill = async (usersAfterTs?: Date) => {
    let foundUsers = false

    for (let i = 0; i < 1e5; i++) {
      console.log('i:', i)
      const offset = batchSize * i
      const rethinkUsers = await r
        .table('User')
        .between(usersAfterTs ?? r.minval, r.maxval, {index: 'updatedAt'})
        .orderBy('updatedAt', {index: 'updatedAt'})
        .filter((row) => row.hasFields('segmentId'))
        .pluck('id', 'segmentId')
        .skip(offset)
        .limit(batchSize)
        .run()
      if (!rethinkUsers.length) {
        break
      }
      foundUsers = true
      const pgUsers = rethinkUsers.map(({id, segmentId}) => ({id, segmentId}))
      await catchAndLog(() => backfillSegmentIdQuery.run({users: pgUsers}, getPg()))
    }
    return foundUsers
  }

  const doBackfillAccountingForRaceConditions = async (usersAfterTs?: Date) => {
    for (let i = 0; i < 1e5; i++) {
      const thisBackfillStartTs = new Date()
      const backfillFoundUsers = await doBackfill(usersAfterTs)
      if (!backfillFoundUsers) {
        break
      }
      usersAfterTs = thisBackfillStartTs
    }
  }

  await doBackfillAccountingForRaceConditions()
  console.log('Finished backfilling segmentId.')
}
