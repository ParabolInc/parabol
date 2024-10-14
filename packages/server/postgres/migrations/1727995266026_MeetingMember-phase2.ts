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

  try {
    console.log('Adding index')
    await r
      .table('MeetingMember')
      .indexCreate('updatedAtId', (row: any) => [row('updatedAt'), row('id')])
      .run()
    await r.table('MeetingMember').indexWait().run()
  } catch {
    // index already exists
  }

  console.log('Adding index complete')

  const MAX_PG_PARAMS = 65545
  const PG_COLS = [
    'id',
    'meetingType',
    'meetingId',
    'teamId',
    'updatedAt',
    'userId',
    'isSpectating',
    'votesRemaining'
  ] as const
  type MeetingMember = {
    [K in (typeof PG_COLS)[number]]: any
  }
  const BATCH_SIZE = Math.trunc(MAX_PG_PARAMS / PG_COLS.length)

  let curUpdatedAt = r.minval
  let curId = r.minval

  const insertRow = async (row) => {
    if (!row.teamId) {
      console.log('MeetingMember has no teamId, skipping insert', row.id)
      return
    }
    try {
      await pg
        .insertInto('MeetingMember')
        .values(row)
        .onConflict((oc) => oc.doNothing())
        .execute()
    } catch (e) {
      if (e.constraint === 'fk_teamId') {
        console.log('MeetingMember has no team, skipping insert', row.id)
        return
      }
      if (e.constraint === 'fk_meetingId') {
        console.log('MeetingMember has no meeting, skipping insert', row.id)
        return
      }
      if (e.constraint === 'fk_userId') {
        console.log('MeetingMember has no user, skipping insert', row.id)
        return
      }
      throw e
    }
  }
  for (let i = 0; i < 1e6; i++) {
    console.log('inserting row', i * BATCH_SIZE, String(curUpdatedAt), String(curId))
    const rawRowsToInsert = (await r
      .table('MeetingMember')
      .between([curUpdatedAt, curId], [r.maxval, r.maxval], {
        index: 'updatedAtId',
        leftBound: 'open',
        rightBound: 'closed'
      })
      .orderBy({index: 'updatedAtId'})
      .limit(BATCH_SIZE)
      .pluck(...PG_COLS)
      .run()) as MeetingMember[]

    const rowsToInsert = rawRowsToInsert.map((row) => {
      const {id, meetingType, meetingId, teamId, updatedAt, userId, isSpectating, votesRemaining} =
        row as any
      return {
        id,
        meetingType,
        meetingId,
        teamId,
        updatedAt,
        userId,
        isSpectating,
        votesRemaining
      }
    })

    if (rowsToInsert.length === 0) break
    const lastRow = rowsToInsert[rowsToInsert.length - 1]
    curUpdatedAt = lastRow.updatedAt
    curId = lastRow.id
    await Promise.all(rowsToInsert.map(async (row) => insertRow(row)))
  }
}

export async function down() {
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })
  await sql`TRUNCATE TABLE "MeetingMember" CASCADE`.execute(pg)
}
