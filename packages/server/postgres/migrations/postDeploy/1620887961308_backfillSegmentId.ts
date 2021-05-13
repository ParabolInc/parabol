import {ColumnDefinitions, MigrationBuilder} from 'node-pg-migrate'
import getRethink from '../../../database/rethinkDriver'
import updateUser from '../../queries/updateUser'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(): Promise<void> {
  const r = await getRethink()
  const doBackfill = async (usersAfterTs?: Date) => {
    const rethinkUsers = await r
      .table('User')
      .between(usersAfterTs ?? r.minval, r.maxval, {index: 'updatedAt'})
      .orderBy('updatedAt', {index: 'updatedAt'})
      .filter((row) => row.hasFields('segmentId'))
      .run()

    rethinkUsers.forEach(({id, segmentId}) => updateUser({segmentId}, id))
  }
  await doBackfill()
  console.log('Finished backfilling segmentIds for users')
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // noop
}
