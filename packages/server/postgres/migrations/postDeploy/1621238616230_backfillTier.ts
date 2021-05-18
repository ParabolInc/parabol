import {ColumnDefinitions} from 'node-pg-migrate'
import {TierEnum} from 'parabol-client/types/graphql'
import getRethink from '../../../database/rethinkDriver'
import getPg from '../../getPg'
import {backfillTierQuery} from '../../queries/generated/backfillTierQuery'
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
        .filter((row) => row('tier').ne(TierEnum.personal))
        .pluck('id', 'tier')
        .skip(offset)
        .limit(batchSize)
        .run()) as {tier: string; id: string}[]
      if (!affectedUsers.length) {
        break
      }
      moreUsersToBackfill = true
      await catchAndLog(() => backfillTierQuery.run({users: affectedUsers}, getPg()))
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
