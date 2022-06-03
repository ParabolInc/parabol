import {ColumnDefinitions} from 'node-pg-migrate'
import getRethink from '../../../database/rethinkDriver'
import {backfillSegmentIdQuery} from '../../generatedMigrationHelpers'
import getPg from '../../getPg'
import catchAndLog from '../../utils/catchAndLog'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(): Promise<void> {
  const r = await getRethink()
  const batchSize = 3000
  const doBackfill = async (usersAfterTs?: Date) => {
    let moreUsersToBackfill = false

    for (let i = 0; i < 1e5; i++) {
      const offset = batchSize * i
      const affectedUsers = (await r
        .table('User')
        .between(usersAfterTs ?? r.minval, r.maxval, {index: 'updatedAt'})
        .orderBy('updatedAt', {index: 'updatedAt'})
        .filter((row) => row.hasFields('segmentId'))
        .pluck('id', 'segmentId')
        .skip(offset)
        .limit(batchSize)
        .run()) as {segmentId: string; id: string}[]
      if (!affectedUsers.length) {
        break
      }
      moreUsersToBackfill = true
      await catchAndLog(() => backfillSegmentIdQuery.run({users: affectedUsers}, getPg()))
    }
    return moreUsersToBackfill
  }

  const doBackfillAccountingForRaceConditions = async (usersAfterTs?: Date) => {
    for (let i = 0; i < 1e5; i++) {
      const thisBackfillStartTs = new Date()
      const moreUsersToBackfill = await doBackfill(usersAfterTs)
      if (!moreUsersToBackfill) {
        break
      }
      usersAfterTs = thisBackfillStartTs
    }
  }

  await doBackfillAccountingForRaceConditions()
}
