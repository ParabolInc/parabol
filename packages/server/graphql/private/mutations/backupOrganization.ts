import childProcess from 'child_process'
import fs from 'fs'
import path from 'path'
import util from 'util'
import getProjectRoot from '../../../../../scripts/webpack/utils/getProjectRoot'
import getKysely from '../../../postgres/getKysely'
import getPg from '../../../postgres/getPg'
import getPgConfig from '../../../postgres/getPgConfig'
import {Logger} from '../../../utils/Logger'
import {MutationResolvers} from '../resolverTypes'

const exec = util.promisify(childProcess.exec)

const dumpPgDataToOrgBackupSchema = async (orgIds: string[]) => {
  const pg = getKysely()

  // fetch needed items upfront
  const teams = await pg.selectFrom('Team').select('id').where('orgId', 'in', orgIds).execute()
  const teamIds = teams.map(({id}) => id)
  const orgUsers = await pg
    .selectFrom('OrganizationUser')
    .select('userId')
    .where('orgId', 'in', orgIds)
    .where('removedAt', 'is', null)
    .execute()
  const userIds = orgUsers.map(({userId}) => userId)
  Logger.log({teamIds, userIds})

  // try {
  //   // do all inserts here
  //   await client.query('BEGIN')
  //   await client.query(`DROP SCHEMA IF EXISTS "orgBackup" CASCADE;`)
  //   await client.query(`CREATE SCHEMA "orgBackup";`)
  //   await client.query(`CREATE TABLE "orgBackup"."PgMigrations" AS (SELECT * FROM "PgMigrations");`)
  //   await client.query(
  //     `CREATE TABLE "orgBackup"."OrganizationUserAudit" AS (SELECT * FROM "OrganizationUserAudit" WHERE "orgId" = ANY ($1));`,
  //     [orgIds]
  //   )
  //   await client.query(
  //     `CREATE TABLE "orgBackup"."Team" AS (SELECT * FROM "Team" WHERE "orgId" = ANY ($1));`,
  //     [orgIds]
  //   )
  //   await client.query(
  //     `CREATE TABLE "orgBackup"."GitHubAuth" AS (SELECT * FROM "GitHubAuth" WHERE "teamId" = ANY ($1));`,
  //     [teamIds]
  //   )
  //   await client.query(
  //     `CREATE TABLE "orgBackup"."AtlassianAuth" AS (SELECT * FROM "AtlassianAuth" WHERE "teamId" = ANY ($1));`,
  //     [teamIds]
  //   )
  //   await client.query(
  //     `CREATE TABLE "orgBackup"."Discussion" AS (SELECT * FROM "Discussion" WHERE "teamId" = ANY ($1));`,
  //     [teamIds]
  //   )
  //   await client.query(
  //     `CREATE TABLE "orgBackup"."TaskEstimate" AS (SELECT * FROM "TaskEstimate" WHERE "userId" = ANY ($1));`,
  //     [userIds]
  //   )
  //   await client.query(
  //     `CREATE TABLE "orgBackup"."User" AS (SELECT * FROM "User" WHERE "id" = ANY ($1));`,
  //     [userIds]
  //   )
  //   await client.query(
  //     `CREATE TABLE "orgBackup"."TemplateRef" AS (SELECT * FROM "TemplateRef" WHERE "id" = ANY ($1));`,
  //     [templateRefIds]
  //   )
  //   await client.query(
  //     `CREATE TABLE "orgBackup"."TemplateScaleRef" AS (SELECT * FROM "TemplateScaleRef" WHERE "id" = ANY ($1));`,
  //     [templateScaleRefIds]
  //   )
  //   await client.query('COMMIT')
  // } catch (e) {
  //   await client.query('ROLLBACK')
  //   throw e
  // } finally {
  //   client.release()
  // }
}

const backupPgOrganization = async (orgIds: string[]) => {
  const PROJECT_ROOT = getProjectRoot() as string
  const PG_BACKUP_ROOT = path.join(PROJECT_ROOT, 'pgBackup')
  if (!fs.existsSync(PG_BACKUP_ROOT)) {
    fs.mkdirSync(PG_BACKUP_ROOT, {recursive: true})
  }
  const schemaTargetLocation = path.resolve(PG_BACKUP_ROOT, 'schemaDump.tar.gz')
  const dataTargetLocation = path.resolve(PG_BACKUP_ROOT, 'orgBackupData.tar.gz')
  const config = getPgConfig()
  const {user, password, database, host, port} = config
  const dbName = `postgresql://${user}:${password}@${host}:${port}/${database}`
  await exec(`pg_dump ${dbName} --format=c --schema-only --file ${schemaTargetLocation}`)
  await dumpPgDataToOrgBackupSchema(orgIds)
  await exec(
    `pg_dump ${dbName} --format=c --data-only --schema='"orgBackup"' --file ${dataTargetLocation}`
  )
  const pg = getPg()
  await pg.query(`DROP SCHEMA IF EXISTS "orgBackup" CASCADE;`)
}

const backupOrganization: MutationResolvers['backupOrganization'] = async (_source, {orgIds}) => {
  // RESOLUTION
  await backupPgOrganization(orgIds)
  return `Not yet implemented!`
}

export default backupOrganization
