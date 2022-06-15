import {ColumnDefinitions, MigrationBuilder} from 'node-pg-migrate'
import getRethink from '../../../database/rethinkDriver'
import {updateUser} from '../../generatedMigrationHelpers'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  const r = await getRethink()
  const batchSize = 3000
  const doBackfill = async (usersAfterTs?: Date) => {
    const moreUsersToBackfill = false

    for (let i = 0; i < 1e5; i++) {
      const offset = batchSize * i
      const userIds = (await r
        .table('User')
        .between(usersAfterTs ?? r.minval, r.maxval, {index: 'updatedAt'})
        .orderBy('updatedAt', {index: 'updatedAt'})
        .filter((row) => row('overLimitCopy').eq(null))
        .pluck('id')
        .skip(offset)
        .limit(batchSize)
        .run()) as {id: string}[]
      if (!userIds.length) {
        break
      }
      updateUser(
        {overLimitCopy: ''},
        userIds.map(({id}) => id)
      )
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
