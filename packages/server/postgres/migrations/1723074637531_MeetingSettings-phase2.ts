import {Kysely, PostgresDialect, sql} from 'kysely'
import {r} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'
import getPg from '../getPg'

export async function up() {
  await connectRethinkDB()
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })

  const MAX_PG_PARAMS = 65545

  const PG_COLS = [
    'id',
    'phaseTypes',
    'meetingType',
    'teamId',
    'selectedTemplateId',
    'jiraSearchQueries',
    'maxVotesPerGroup',
    'totalVotes',
    'disableAnonymity',
    'videoMeetingURL'
  ] as const
  type MeetingSettings = {
    [K in (typeof PG_COLS)[number]]: any
  }
  const BATCH_SIZE = Math.trunc(MAX_PG_PARAMS / PG_COLS.length)

  const startAt = new Date()
  let curId = r.minval
  for (let i = 0; i < 1e6; i++) {
    console.log('inserting row', i * BATCH_SIZE, curId)
    let rawRowsToInsert = (await r
      .table('MeetingSettings')
      .between(curId, r.maxval, {
        index: 'id',
        leftBound: 'open',
        rightBound: 'closed'
      })
      .orderBy({index: 'id'})
      .limit(BATCH_SIZE)
      .pluck(...PG_COLS)
      .run()) as MeetingSettings[]
    if (rawRowsToInsert.length === 0) {
      // since we don't have a createdAt, it's possible new rows were created while this was running.
      // Grab those new teams & get their settings, too
      const newTeams = await pg
        .selectFrom('Team')
        .select('id')
        .where('createdAt', '>', startAt)
        .execute()
      const newTeamIds = newTeams.map((team) => team.id)
      console.log('got new TeamIds!', newTeamIds)
      if (newTeamIds.length === 0) break
      rawRowsToInsert = (await r
        .table('MeetingSettings')
        .getAll(r.args(newTeamIds))
        .pluck(...PG_COLS)
        .run()) as MeetingSettings[]
    }
    const rowsToInsert = rawRowsToInsert.map((row) => ({
      ...row
    }))
    if (rowsToInsert.length === 0) break
    const lastRow = rowsToInsert[rowsToInsert.length - 1]
    curId = lastRow.id
    await Promise.all(
      rowsToInsert.map(async (row) => {
        try {
          await pg
            .insertInto('MeetingSettings')
            .values(row)
            .onConflict((oc) => oc.doNothing())
            .execute()
        } catch (e) {
          if (e.constraint === 'fk_teamId') {
            // console.log(`Skipping ${row.id} because it has no team`)
            return
          }
          if (e.constraint === 'fk_selectedTemplateId') {
            // console.log(`Skipping ${row.id} because it has no template`)
            return
          }
          console.log(e, row)
        }
      })
    )
  }
}

export async function down() {
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })
  await sql`TRUNCATE TABLE "MeetingSettings" CASCADE`.execute(pg)
}
