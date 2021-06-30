import {ColumnDefinitions, MigrationBuilder} from 'node-pg-migrate'
import getRethink from '../../../database/rethinkDriver'
import getPg from '../../getPg'
import {backupUserQuery} from '../../queries/generated/backupUserQuery'
import updateUser from '../../queries/updateUser'
import catchAndLog from '../../utils/catchAndLog'

export const shorthands: ColumnDefinitions | undefined = undefined

const undefinedUserFieldsAndTheirDefaultPgValues = {
  newFeatureId: null,
  overLimitCopy: null,
  isRemoved: false,
  segmentId: null,
  reasonRemoved: null,
  rol: null,
  // app doesn't allow following fields to be undefined, but found bad data anyway
  inactive: false,
  payLaterClickCount: 0,
  featureFlags: []
}

export async function up(pgm: MigrationBuilder): Promise<void> {
  const result = await pgm.db.query(`
    SELECT ARRAY_AGG("id") FROM "User"
      WHERE "email" LIKE 'DELETED:%';
  `)
  const deletedUserIds = result.rows[0]['array_agg']
  await updateUser({email: 'DELETED'}, deletedUserIds)

  const r = await getRethink()
  const skippedUserIds = ['local|1BIzNRvD', 'local|1wzYF43N', 'local|nm0nwe77AA']
  const skippedRethinkUsers = await r
    .table('User')
    .getAll(r.args(skippedUserIds))
    .run()
  const skippedPgUsers = skippedRethinkUsers.map((user) => ({
    ...undefinedUserFieldsAndTheirDefaultPgValues,
    ...user
  }))
  await catchAndLog(() => backupUserQuery.run({users: skippedPgUsers}, getPg()))
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // noop
}
