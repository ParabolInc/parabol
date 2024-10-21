import {Kysely, PostgresDialect} from 'kysely'
import connectRethinkDB from '../../database/connectRethinkDB'
import getPg from '../getPg'

export async function up() {
  await connectRethinkDB()
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })

  const removeRelationalIntegrityViolators = async (table: string, fk: string, fkTable: string) => {
    console.log('deleting bad rows', table, fk, fkTable)
    const res = await pg
      .deleteFrom(table)
      .where(fk, 'is not', null)
      .where(({not, exists, selectFrom}) =>
        not(
          exists(selectFrom(fkTable).select('id').whereRef(`${table}.${fk}`, '=', `${fkTable}.id`))
        )
      )
      .executeTakeFirst()
    console.log(`Deleted ${res.numDeletedRows} rows from ${table} with bad ${fk}`)
  }

  const addFKConstraint = async (table: string, fk: string, fkTable: string) => {
    console.log('adding constraint', table, fk, fkTable)
    try {
      await pg.schema
        .alterTable(table)
        .addForeignKeyConstraint(`fk_${fk}`, [fk], fkTable, ['id'])
        .onDelete('cascade')
        .execute()
    } catch (e) {
      console.log('error adding constraint', table, fk, fkTable, e)
      return
    }
    console.log('added constraint', table, fk, fkTable)
  }

  const violations = [
    {table: 'AtlassianAuth', fk: 'userId', fkTable: 'User'},
    {table: 'AtlassianAuth', fk: 'teamId', fkTable: 'Team'},
    {table: 'AzureDevOpsDimensionFieldMap', fk: 'teamId', fkTable: 'Team'},
    {table: 'Discussion', fk: 'teamId', fkTable: 'Team'},
    {table: 'Discussion', fk: 'meetingId', fkTable: 'NewMeeting'},
    {table: 'GitHubAuth', fk: 'userId', fkTable: 'User'},
    {table: 'GitHubAuth', fk: 'teamId', fkTable: 'Team'},
    {table: 'GitHubDimensionFieldMap', fk: 'teamId', fkTable: 'Team'},
    {table: 'GitLabDimensionFieldMap', fk: 'teamId', fkTable: 'Team'},
    {table: 'Insight', fk: 'teamId', fkTable: 'Team'},
    {table: 'IntegrationProvider', fk: 'orgId', fkTable: 'Organization'},
    {table: 'IntegrationSearchQuery', fk: 'teamId', fkTable: 'Team'},
    {table: 'JiraDimensionFieldMap', fk: 'teamId', fkTable: 'Team'},
    {table: 'JiraServerDimensionFieldMap', fk: 'teamId', fkTable: 'Team'},
    {table: 'OrganizationApprovedDomain', fk: 'orgId', fkTable: 'Organization'},
    {table: 'OrganizationUserAudit', fk: 'orgId', fkTable: 'Organization'},
    {table: 'OrganizationUserAudit', fk: 'userId', fkTable: 'User'},
    {table: 'Poll', fk: 'meetingId', fkTable: 'NewMeeting'},
    {table: 'RetroReflection', fk: 'promptId', fkTable: 'ReflectPrompt'},
    {table: 'RetroReflection', fk: 'meetingId', fkTable: 'NewMeeting'},
    {table: 'RetroReflectionGroup', fk: 'promptId', fkTable: 'ReflectPrompt'},
    {table: 'RetroReflectionGroup', fk: 'meetingId', fkTable: 'NewMeeting'},
    {table: 'ScheduledJob', fk: 'orgId', fkTable: 'Organization'},
    {table: 'ScheduledJob', fk: 'meetingId', fkTable: 'NewMeeting'},
    {table: 'TaskEstimate', fk: 'taskId', fkTable: 'Task'},
    {table: 'TaskEstimate', fk: 'userId', fkTable: 'User'},
    {table: 'TaskEstimate', fk: 'meetingId', fkTable: 'NewMeeting'},
    {table: 'TaskEstimate', fk: 'discussionId', fkTable: 'Discussion'},
    {table: 'Team', fk: 'orgId', fkTable: 'Organization'},
    {table: 'TeamPromptResponse', fk: 'meetingId', fkTable: 'NewMeeting'},
    {table: 'TimelineEvent', fk: 'orgId', fkTable: 'Organization'},
    {table: 'TimelineEvent', fk: 'meetingId', fkTable: 'NewMeeting'}
  ]
  for (let i = 0; i < violations.length; i++) {
    const {table, fk, fkTable} = violations[i]
    await removeRelationalIntegrityViolators(table, fk, fkTable)
    await addFKConstraint(table, fk, fkTable)
  }
}

export async function down() {
  // noop
}
