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
    await r
      .table('RetroReflectionGroup')
      .indexCreate('updatedAtId', (row: any) => [row('updatedAt'), row('id')])
      .run()
    await r.table('RetroReflectionGroup').indexWait().run()
  } catch {
    // index already exists
  }

  await pg.schema
    .alterTable('RetroReflectionGroup')
    .alterColumn('voterIds', (ac) => ac.setDataType(sql`text[]`))
    .alterColumn('promptId', (ac) => ac.setDataType('varchar(111)'))
    .execute()

  const MAX_PG_PARAMS = 65545
  const PG_COLS = [
    'id',
    'createdAt',
    'updatedAt',
    'isActive',
    'meetingId',
    'promptId',
    'sortOrder',
    'voterIds',
    'smartTitle',
    'title',
    'summary',
    'discussionPromptQuestion'
  ] as const
  type RetroReflectionGroup = {
    [K in (typeof PG_COLS)[number]]: any
  }
  const BATCH_SIZE = Math.trunc(MAX_PG_PARAMS / PG_COLS.length)

  let curUpdatedAt = r.minval
  let curId = r.minval
  for (let i = 0; i < 1e6; i++) {
    const rawRowsToInsert = (await r
      .table('RetroReflectionGroup')
      .between([curUpdatedAt, curId], [r.maxval, r.maxval], {
        index: 'updatedAtId',
        leftBound: 'open',
        rightBound: 'closed'
      })
      .orderBy({index: 'updatedAtId'})
      .limit(BATCH_SIZE)
      .pluck(...PG_COLS)
      .run()) as RetroReflectionGroup[]

    const rowsToInsert = rawRowsToInsert.map((row) => ({
      ...row,
      title: row.title?.slice(0, 255),
      smartTitle: row.smartTitle?.slice(0, 255),
      summary: row.summary?.slice(0, 2000)
    }))
    if (rowsToInsert.length === 0) break
    const lastRow = rowsToInsert[rowsToInsert.length - 1]
    curUpdatedAt = lastRow.updatedAt
    curId = lastRow.id
    try {
      await pg
        .insertInto('RetroReflectionGroup')
        .values(rowsToInsert)
        .onConflict((oc) => oc.doNothing())
        .execute()
    } catch (e) {
      console.log({lastRow}, rowsToInsert.length)
      await Promise.all(
        rowsToInsert.map(async (row) => {
          try {
            const res = await pg
              .insertInto('RetroReflectionGroup')
              .values(row)
              .onConflict((oc) => oc.doNothing())
              .execute()
          } catch (e) {
            console.log(e, row)
          }
        })
      )
      throw e
    }
  }
}

export async function down() {
  await connectRethinkDB()
  try {
    await r.table('RetroReflectionGroup').indexDrop('updatedAtId').run()
  } catch {
    // index already dropped
  }
}
