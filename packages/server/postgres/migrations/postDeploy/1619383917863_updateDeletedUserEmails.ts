/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import updateUser from '../../queries/updateUser'
import getRethink from '../../../database/rethinkDriver'
import User from '../../../database/types/User'
import {backupUserQuery, IBackupUserQueryParams} from '../../queries/generated/backupUserQuery'
import getPg from '../../getPg'
import catchAndLog from '../../utils/catchAndLog'

export const shorthands: ColumnDefinitions | undefined = undefined;

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

const cleanUsers = (users: User[]): IBackupUserQueryParams['users'] => {
  const cleanedUsers = [] as any
  users.forEach((user) => {
    const cleanedUser = Object.assign(
      {},
      undefinedUserFieldsAndTheirDefaultPgValues,
      user
    ) as IBackupUserQueryParams['users'][0]
    cleanedUsers.push(cleanedUser)
  })
  return cleanedUsers
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
  const skippedPgUsers = cleanUsers(skippedRethinkUsers)
  await catchAndLog(() => backupUserQuery.run({users: skippedPgUsers}, getPg()))
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // noop
}
