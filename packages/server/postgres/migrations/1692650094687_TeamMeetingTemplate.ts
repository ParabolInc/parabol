import {Kysely, PostgresDialect, sql} from 'kysely'
import {Client} from 'pg'
import {r} from 'rethinkdb-ts'
import getPg from '../getPg'
import getPgConfig from '../getPgConfig'

interface TeamMeetingTemplate {
  teamId: string
  templateId: string
  lastUsedAt: Date
}

const connectRethinkDB = async () => {
  const {hostname: host, port, pathname} = new URL(process.env.RETHINKDB_URL!)
  await r.connectPool({
    host,
    port: parseInt(port, 10),
    db: pathname.split('/')[1]
  })
}

export async function up() {
  await connectRethinkDB()
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })
  await sql`
  CREATE TABLE IF NOT EXISTS "TeamMeetingTemplate" (
    "teamId" VARCHAR(100) NOT NULL,
    "templateId" VARCHAR(100) NOT NULL,
    "lastUsedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE ("teamId","templateId"),
    CONSTRAINT "fk_teamId"
      FOREIGN KEY("teamId")
        REFERENCES "Team"("id")
        ON DELETE CASCADE,
    CONSTRAINT "fk_templateId"
      FOREIGN KEY("templateId")
        REFERENCES "MeetingTemplate"("id")
        ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS "idx_TeamMeetingTemplate_teamId" ON "TeamMeetingTemplate"("teamId");
  `.execute(pg)

  // If we miss a new team or 2 that gets created while this is running that's OK!
  // They don't have any used templates to start with
  const teamIdsRes = await pg.selectFrom('Team').select('id').execute()
  const teamIds = teamIdsRes.map((row) => row.id)
  const BATCH_SIZE = 10000

  for (let i = 0; i < 10000; i++) {
    const start = i * BATCH_SIZE
    const end = start + BATCH_SIZE
    const teamIdBatch = teamIds.slice(start, end)
    if (teamIdBatch.length === 0) break
    const rowsToInsert = (await r
      .table('NewMeeting')
      .getAll(r.args(teamIdBatch), {index: 'teamId'})
      .group((row) => ({teamId: row('teamId'), templateId: row('templateId')}))
      .max('createdAt')('createdAt')
      .ungroup()
      .map((row) => ({
        teamId: row('group')('teamId').default(null),
        templateId: row('group')('templateId').default(null),
        lastUsedAt: row('reduction')
      }))
      .filter((row: any) => row('templateId').default(null).ne(null))
      .run()) as TeamMeetingTemplate[]

    // it's possible a templateId exists in NewMeeting, but not in MeetingTemplate
    const attemptedTemplateIds = rowsToInsert.map((r) => r.templateId)
    if (attemptedTemplateIds.length === 0) continue
    const validTemplates = await pg
      .selectFrom('MeetingTemplate')
      .select('id')
      .where('id', 'in', attemptedTemplateIds)
      .execute()
    if (validTemplates.length === 0) continue
    const validTemplateIds = new Set(validTemplates.map(({id}) => id))
    const validRowsToInsert = rowsToInsert.filter((row) => validTemplateIds.has(row.templateId))
    await pg
      .insertInto('TeamMeetingTemplate')
      .values(validRowsToInsert)
      .onConflict((oc) => oc.doNothing())
      .execute()
  }
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`DROP TABLE IF EXISTS "TeamMeetingTemplate";`)
  await client.end()
}
