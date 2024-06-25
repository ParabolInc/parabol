import {Kysely, PostgresDialect} from 'kysely'
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
      .table('TimelineEvent')
      .indexCreate('createdAtId', (row: any) => [row('createdAt'), row('id')])
      .run()
    await r.table('TimelineEvent').indexWait().run()
  } catch {
    // index already exists
  }
  console.log('Adding index complete')
  const MAX_PG_PARAMS = 65545
  const PG_COLS = [
    'id',
    'createdAt',
    'interactionCount',
    'seenCount',
    'type',
    'userId',
    'teamId',
    'orgId',
    'meetingId',
    'isActive'
  ] as const
  type TimelineEvent = {
    [K in (typeof PG_COLS)[number]]: any
  }
  const BATCH_SIZE = Math.trunc(MAX_PG_PARAMS / PG_COLS.length)

  let curUpdatedAt = r.minval
  let curId = r.minval
  for (let i = 0; i < 1e6; i++) {
    console.log('inserting row', i * BATCH_SIZE, curUpdatedAt, curId)
    const rowsToInsert = (await r
      .table('TimelineEvent')
      .between([curUpdatedAt, curId], [r.maxval, r.maxval], {
        index: 'createdAtId',
        leftBound: 'open',
        rightBound: 'closed'
      })
      .orderBy({index: 'createdAtId'})
      .limit(BATCH_SIZE)
      .pluck(...PG_COLS)
      .run()) as TimelineEvent[]

    if (rowsToInsert.length === 0) break
    const lastRow = rowsToInsert[rowsToInsert.length - 1]
    curUpdatedAt = lastRow.createdAt
    curId = lastRow.id
    try {
      await pg
        .insertInto('TimelineEvent')
        .values(rowsToInsert)
        .onConflict((oc) => oc.doNothing())
        .execute()
    } catch (e) {
      await Promise.all(
        rowsToInsert.map(async (row) => {
          try {
            const res = await pg
              .insertInto('TimelineEvent')
              .values(row)
              .onConflict((oc) => oc.doNothing())
              .execute()
          } catch (e) {
            if (e.constraint === 'fk_userId' || e.constraint === 'fk_teamId') {
              // console.log(`Skipping ${row.id} because it has no user/team`)
              return
            }
            console.log(e, row)
          }
        })
      )
    }
  }
}

export async function down() {
  await connectRethinkDB()
  try {
    await r.table('TimelineEvent').indexDrop('createdAtId').run()
  } catch {
    // index already dropped
  }
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })
  await pg.deleteFrom('TimelineEvent').execute()
}
