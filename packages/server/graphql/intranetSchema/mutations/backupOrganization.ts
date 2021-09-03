import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLString} from 'graphql'
import getRethink from '../../../database/rethinkDriver'
import {requireSU} from '../../../utils/authorization'
import {GQLContext} from '../../graphql'
import util from 'util'
import childProcess from 'child_process'
import path from 'path'
import getProjectRoot from '../../../../../scripts/webpack/utils/getProjectRoot'
import getPg from '../../../postgres/getPg'

const execFilePromise = util.promisify(childProcess.execFile)
const PROJECT_ROOT = getProjectRoot()

const dumpPg = async (options: string) => {
  const pathToDumpScriptFromPackage = `postgres/scripts/dump.sh`
  const absPathToDumpScript = path.resolve(
    PROJECT_ROOT,
    'packages/server',
    pathToDumpScriptFromPackage
  )
  const {stdout, stderr} = await execFilePromise(absPathToDumpScript, [options])
  console.info(`${pathToDumpScriptFromPackage}:`, stdout)
  console.error(`${pathToDumpScriptFromPackage}:`, stderr)
}

const dumpPgDataToOrgBackupSchema = async (orgIds: string[]) => {
  const pg = getPg()
  const client = await pg.connect()
  // rethink client for when we need to join with rethink
  const r = await getRethink()

  // fetch needed items upfront
  const teams = await client.query('SELECT "id" FROM "Team" WHERE "orgId" = ANY ($1);', [orgIds])
  const teamIds = teams.rows.map((team) => team.id)
  const [userIds, templateRefIds] = await Promise.all([
    r
      .table('TeamMember')
      .getAll(r.args(teamIds), {index: 'teamId'})('userId')
      .coerceTo('array')
      .distinct()
      .run(),
    (r
      .table('NewMeeting')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter((row) => row.hasFields('templateRefId')) as any)('templateRefId')
      .coerceTo('array')
      .distinct()
      .run()
  ])
  const templateRefs = await client.query(
    `SELECT jsonb_array_elements("template" -> 'dimensions') -> 'scaleRefId' AS "scaleRefId" FROM "TemplateRef" WHERE "id" = ANY ($1);`,
    [templateRefIds]
  )
  const templateScaleRefIds = templateRefs.rows.map(({scaleRefId}) => scaleRefId)

  try {
    // do all inserts here
    await client.query('BEGIN')
    await client.query(`DROP SCHEMA IF EXISTS "orgBackup" CASCADE;`)
    await client.query(`CREATE SCHEMA "orgBackup";`)
    await client.query(`CREATE TABLE "orgBackup"."PgMigrations" AS (SELECT * FROM "PgMigrations");`)
    await client.query(
      `CREATE TABLE "orgBackup"."PgPostDeployMigrations" AS (SELECT * FROM "PgPostDeployMigrations");`
    )
    await client.query(
      `CREATE TABLE "orgBackup"."OrganizationUserAudit" AS (SELECT * FROM "OrganizationUserAudit" WHERE "orgId" = ANY ($1));`,
      [orgIds]
    )
    await client.query(
      `CREATE TABLE "orgBackup"."Team" AS (SELECT * FROM "Team" WHERE "orgId" = ANY ($1));`,
      [orgIds]
    )
    await client.query(
      `CREATE TABLE "orgBackup"."GitHubAuth" AS (SELECT * FROM "GitHubAuth" WHERE "teamId" = ANY ($1));`,
      [teamIds]
    )
    await client.query(
      `CREATE TABLE "orgBackup"."AtlassianAuth" AS (SELECT * FROM "AtlassianAuth" WHERE "teamId" = ANY ($1));`,
      [teamIds]
    )
    await client.query(
      `CREATE TABLE "orgBackup"."Discussion" AS (SELECT * FROM "Discussion" WHERE "teamId" = ANY ($1));`,
      [teamIds]
    )
    await client.query(
      `CREATE TABLE "orgBackup"."TaskEstimate" AS (SELECT * FROM "TaskEstimate" WHERE "userId" = ANY ($1));`,
      [userIds]
    )
    await client.query(
      `CREATE TABLE "orgBackup"."User" AS (SELECT * FROM "User" WHERE "id" = ANY ($1));`,
      [userIds]
    )
    await client.query(
      `CREATE TABLE "orgBackup"."TemplateRef" AS (SELECT * FROM "TemplateRef" WHERE "id" = ANY ($1));`,
      [templateRefIds]
    )
    await client.query(
      `CREATE TABLE "orgBackup"."TemplateScaleRef" AS (SELECT * FROM "TemplateScaleRef" WHERE "id" = ANY ($1));`,
      [templateScaleRefIds]
    )
    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

const backupPgOrganization = async (orgIds: string[]) => {
  const schemaTargetLocation = path.resolve(PROJECT_ROOT, 'artifacts/schemaDump.tar.gz')
  const schemaOpts = `-Fc --schema-only --file ${schemaTargetLocation}`
  const dataTargetLocation = path.resolve(PROJECT_ROOT, 'artifacts/orgBackupData.tar.gz')
  const dataOpts = `-Fc --data-only --file ${dataTargetLocation} --schema="orgBackup"`

  await dumpPg(schemaOpts)
  await dumpPgDataToOrgBackupSchema(orgIds)
  await dumpPg(dataOpts)
}

const backupOrganization = {
  type: GraphQLNonNull(GraphQLString),
  description: 'copies all the records from RethinkDB for a list of organizations',
  args: {
    orgIds: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(GraphQLID)))
    }
  },
  resolve: async (_source, {orgIds}, {authToken}: GQLContext) => {
    // AUTH
    requireSU(authToken)

    // RESOLUTION
    await backupPgOrganization(orgIds)

    const r = await getRethink()
    const DESTINATION = 'orgBackup'

    // create the DB
    try {
      await r.dbDrop(DESTINATION).run()
    } catch (e) {
      // db never existed. all good
    }
    await r.dbCreate(DESTINATION).run()
    // create all the tables
    await (r.tableList() as any)
      .forEach((table) => {
        return r.db(DESTINATION).tableCreate(table)
      })
      .run()

    // now create all the indexes
    await (r.tableList() as any)
      .forEach((table) => {
        return r
          .table(table)
          .indexStatus()
          .forEach((idx) => {
            return r
              .db(DESTINATION)
              .table(table)
              .indexCreate(idx('index'), idx('function'), {
                geo: (idx('geo') as any) as boolean,
                multi: (idx('multi') as any) as boolean
              })
          })
      })
      .run()

    // get all the teams for the orgIds
    const team = await r
      .table('Team')
      .getAll(r.args(orgIds), {index: 'orgId'})
      .run()
    const teamIds = team.map((team) => team.id)
    await r({
      // easy things to clone
      migrations: r
        .table('_migrations' as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('_migrations' as any)
            .insert(items)
        ),
      agendaItem: (r.table('AgendaItem').getAll(r.args(teamIds), {index: 'teamId'}) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('AgendaItem')
            .insert(items)
        ),
      atlassianAuth: (r.table('AtlassianAuth').getAll(r.args(teamIds), {index: 'teamId'}) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('AtlassianAuth')
            .insert(items)
        ),
      invoice: (r.table('Invoice').filter((row) => r(orgIds).contains(row('orgId'))) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('Invoice')
            .insert(items)
        ),
      invoiceItemHook: (r
        .table('InvoiceItemHook')
        .filter((row) => r(orgIds).contains(row('orgId'))) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('InvoiceItemHook')
            .insert(items)
        ),
      meetingMember: (r.table('MeetingMember').getAll(r.args(teamIds), {index: 'teamId'}) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('MeetingMember')
            .insert(items)
        ),
      meetingSettings: (r
        .table('MeetingSettings')
        .getAll(r.args(teamIds), {index: 'teamId'}) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('MeetingSettings')
            .insert(items)
        ),
      newMeeting: (r.table('NewMeeting').getAll(r.args(teamIds), {index: 'teamId'}) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('NewMeeting')
            .insert(items)
        ),
      organization: (r.table('Organization').getAll(r.args(orgIds)) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('Organization')
            .insert(items)
        ),
      organizationUser: (r
        .table('OrganizationUser')
        .getAll(r.args(orgIds), {index: 'orgId'}) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('OrganizationUser')
            .insert(items)
        ),
      reflectPrompt: (r.table('ReflectPrompt').getAll(r.args(teamIds), {index: 'teamId'}) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('ReflectPrompt')
            .insert(items)
        ),
      meetingTemplate: (r
        .table('MeetingTemplate')
        .getAll(r.args(teamIds), {index: 'teamId'}) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('MeetingTemplate')
            .insert(items)
        ),
      templateDimension: (r
        .table('TemplateDimension')
        .filter((row) => r(teamIds).contains(row('teamId'))) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('TemplateDimension')
            .insert(items)
        ),
      templateScale: (r
        .table('TemplateScale')
        .filter((row) => r(teamIds).contains(row('teamId'))) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('TemplateScale')
            .insert(items)
        ),
      slackAuth: (r.table('SlackAuth').getAll(r.args(teamIds), {index: 'teamId'}) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('SlackAuth')
            .insert(items)
        ),
      slackNotification: (r
        .table('SlackNotification')
        .getAll(r.args(teamIds), {index: 'teamId'}) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('SlackNotification')
            .insert(items)
        ),
      task: (r.table('Task').getAll(r.args(teamIds), {index: 'teamId'}) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('Task')
            .insert(items)
        ),
      team: r
        .db(DESTINATION)
        .table('Team')
        .insert(team),
      teamInvitation: (r.table('TeamInvitation').getAll(r.args(teamIds), {index: 'teamId'}) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('TeamInvitation')
            .insert(items)
        ),
      teamMember: (r.table('TeamMember').getAll(r.args(teamIds), {index: 'teamId'}) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('TeamMember')
            .insert(items)
        ),
      // hard things to clone
      userIds: r
        .table('TeamMember')
        .getAll(r.args(teamIds), {index: 'teamId'})('userId')
        .coerceTo('array')
        .distinct()
        .do((userIds) => {
          return r({
            notification: (r
              .table('Notification')
              .getAll(r.args(userIds), {index: 'userId'}) as any)
              .filter((notification) =>
                r.branch(
                  notification('teamId')
                    .default(null)
                    .ne(null),
                  r(teamIds).contains(notification('teamId')),
                  notification('orgId')
                    .default(null)
                    .ne(null),
                  r(orgIds).contains(notification('orgId')),
                  true
                )
              )
              .coerceTo('array')
              .do((items) =>
                r
                  .db(DESTINATION)
                  .table('Notification')
                  .insert(items)
              ),
            suggestedAction: (r
              .table('SuggestedAction')
              .getAll(r.args(userIds), {index: 'userId'}) as any)
              .filter((row) =>
                r.or(
                  row('teamId')
                    .default(null)
                    .eq(null),
                  r(teamIds).contains(row('teamId'))
                )
              )
              .coerceTo('array')
              .do((items) =>
                r
                  .db(DESTINATION)
                  .table('SuggestedAction')
                  .insert(items)
              ),
            timelineEvent: (r
              .table('TimelineEvent')
              .filter((row) => r(userIds).contains(row('userId'))) as any)
              .filter((row) => r.branch(row('teamId'), r(teamIds).contains(row('teamId')), true))
              .coerceTo('array')
              .do((items) =>
                r
                  .db(DESTINATION)
                  .table('TimelineEvent')
                  .insert(items)
              ),
            user: (r.table('User').getAll(r.args(userIds)) as any).coerceTo('array').do((items) =>
              r
                .db(DESTINATION)
                .table('User')
                .insert(items)
            )
          })
        }),
      activeDomains: r
        .table('Organization')
        .getAll(r.args(orgIds))('activeDomain')
        .coerceTo('array')
        .do((domains) => {
          return r({
            SAML: (r.table('SAML').getAll(r.args(domains), {index: 'domains'}) as any)
              .coerceTo('array')
              .do((items) =>
                r
                  .db(DESTINATION)
                  .table('SAML')
                  .insert(items)
              ),
            secureDomain: (r
              .table('SecureDomain')
              .getAll(r.args(domains), {index: 'domain'}) as any)
              .coerceTo('array')
              .do((items) =>
                r
                  .db(DESTINATION)
                  .table('SecureDomain')
                  .insert(items)
              )
          })
        }),
      meetingIds: r
        .table('NewMeeting')
        .getAll(r.args(teamIds), {index: 'teamId'})('id')
        .coerceTo('array')
        .do((meetingIds) => {
          return r({
            retroReflection: (r
              .table('RetroReflection')
              .getAll(r.args(meetingIds), {index: 'meetingId'}) as any)
              .coerceTo('array')
              .do((items) =>
                r
                  .db(DESTINATION)
                  .table('RetroReflection')
                  .insert(items)
              ),
            retroReflectionGroup: (r
              .table('RetroReflectionGroup')
              .getAll(r.args(meetingIds), {index: 'meetingId'}) as any)
              .coerceTo('array')
              .do((items) =>
                r
                  .db(DESTINATION)
                  .table('RetroReflectionGroup')
                  .insert(items)
              ),
            // really hard things to clone
            reflectionGroupComments: r
              .table('RetroReflectionGroup')
              .getAll(r.args(meetingIds), {index: 'meetingId'})('id')
              .coerceTo('array')
              .do((discussionIds) => {
                return (r
                  .table('Comment')
                  .getAll(r.args(discussionIds), {index: 'discussionId'}) as any)
                  .coerceTo('array')
                  .do((items) =>
                    r
                      .db(DESTINATION)
                      .table('Comment')
                      .insert(items)
                  )
              }),
            agendaItemComments: r
              .table('AgendaItem')
              .getAll(r.args(meetingIds), {index: 'meetingId'})('id')
              .coerceTo('array')
              .do((discussionIds) => {
                return (r
                  .table('Comment')
                  .getAll(r.args(discussionIds), {index: 'discussionId'}) as any)
                  .coerceTo('array')
                  .do((items) =>
                    r
                      .db(DESTINATION)
                      .table('Comment')
                      .insert(items)
                  )
              })
          })
        })
    }).run()

    // remove teamIds that are not part of the desired orgIds
    await r
      .db('orgBackup')
      .table('User')
      .update((row) => ({
        tms: row('tms')
          .innerJoin(r(teamIds), (a, b) => a.eq(b))
          .zip()
      }))
      .run()

    return `Success! 'orgBackup' contains all the records for ${orgIds.join(', ')}`
  }
}
export default backupOrganization
