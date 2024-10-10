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
      .table('TeamInvitation')
      .indexCreate('updatedAtId', (row: any) => [row('expiresAt'), row('id')])
      .run()
    await r.table('TeamInvitation').indexWait().run()
  } catch {
    // index already exists
  }

  console.log('Adding index complete')

  const MAX_PG_PARAMS = 65545
  const PG_COLS = [
    'id',
    'acceptedAt',
    'acceptedBy',
    'createdAt',
    'expiresAt',
    'email',
    'invitedBy',
    'isMassInvite',
    'meetingId',
    'teamId',
    'token'
  ] as const
  type TeamInvitation = {
    [K in (typeof PG_COLS)[number]]: any
  }
  const BATCH_SIZE = Math.trunc(MAX_PG_PARAMS / PG_COLS.length)

  let curUpdatedAt = new Date()
  let curId = r.minval

  const insertRow = async (row) => {
    try {
      await pg
        .insertInto('TeamInvitation')
        .values(row)
        .onConflict((oc) => oc.doNothing())
        .execute()
    } catch (e) {
      if (e.constraint === 'fk_teamId') {
        console.log('TeamInvitation has no team, skipping insert', row.id)
        return
      }
      if (e.constraint === 'fk_meetingId') {
        console.log('TeamInvitation has no meeting, skipping insert', row.id)
        return
      }
      if (e.constraint === 'fk_acceptedBy') {
        console.log('TeamInvitation has no acceptedBy user, skipping insert', row.id)
        return
      }
      if (e.constraint === 'fk_invitedBy') {
        console.log('TeamInvitation has no invitedBy user, skipping insert', row.id)
        return
      }
      throw e
    }
  }
  for (let i = 0; i < 1e6; i++) {
    console.log('inserting row', i * BATCH_SIZE, String(curUpdatedAt), String(curId))
    const rawRowsToInsert = (await r
      .table('TeamInvitation')
      .between([curUpdatedAt, curId], [r.maxval, r.maxval], {
        index: 'updatedAtId',
        leftBound: 'open',
        rightBound: 'closed'
      })
      .orderBy({index: 'updatedAtId'})
      .limit(BATCH_SIZE)
      .pluck(...PG_COLS)
      .run()) as TeamInvitation[]

    const rowsToInsert = rawRowsToInsert.map((row) => {
      const {
        id,
        acceptedAt,
        acceptedBy,
        createdAt,
        expiresAt,
        email,
        invitedBy,
        isMassInvite,
        meetingId,
        teamId,
        token
      } = row as any
      return {
        id,
        acceptedAt,
        acceptedBy,
        createdAt,
        expiresAt,
        email,
        invitedBy,
        isMassInvite,
        meetingId,
        teamId,
        token
      }
    })

    if (rowsToInsert.length === 0) break
    const lastRow = rowsToInsert[rowsToInsert.length - 1]
    curUpdatedAt = lastRow.expiresAt
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
  await sql`TRUNCATE TABLE "TeamInvitation" CASCADE`.execute(pg)
}
