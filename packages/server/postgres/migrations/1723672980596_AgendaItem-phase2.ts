import {Kysely, PostgresDialect, sql} from 'kysely'
import {r} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'
import getPg from '../getPg'

const START_CHAR_CODE = 32
const END_CHAR_CODE = 126

export function positionAfter(pos: string) {
  for (let i = pos.length - 1; i >= 0; i--) {
    const curCharCode = pos.charCodeAt(i)
    if (curCharCode < END_CHAR_CODE) {
      return pos.substr(0, i) + String.fromCharCode(curCharCode + 1)
    }
  }
  return pos + String.fromCharCode(START_CHAR_CODE + 1)
}

export async function up() {
  await connectRethinkDB()
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })

  // add a dummy date for nulls
  const parabolEpoch = new Date('2016-06-01')
  await r
    .table('AgendaItem')
    .update((row) => ({
      updatedAt: row('updatedAt').default(parabolEpoch),
      createdAt: row('createdAt').default(parabolEpoch)
    }))
    .run()
  const strDates = await r
    .table('AgendaItem')
    .filter((row) => row('updatedAt').typeOf().eq('STRING'))
    .pluck('updatedAt', 'id', 'createdAt')
    .run()
  const dateDates = strDates.map((d) => ({
    id: d.id,
    updatedAt: new Date(d.updatedAt),
    createdAt: new Date(d.createdAt)
  }))
  // some dates are
  await r(dateDates)
    .forEach((row: any) => {
      return r
        .table('AgendaItem')
        .get(row('id'))
        .update({updatedAt: row('updatedAt')})
    })
    .run()

  try {
    console.log('Adding index')
    await r
      .table('AgendaItem')
      .indexCreate('updatedAtId', (row: any) => [row('updatedAt'), row('id')])
      .run()
    await r.table('AgendaItem').indexWait().run()
  } catch {
    // index already exists
  }

  console.log('Adding index complete')
  const MAX_PG_PARAMS = 65545
  const PG_COLS = [
    'id',
    'content',
    'createdAt',
    'isActive',
    'isComplete',
    'sortOrder',
    'teamId',
    'teamMemberId',
    'updatedAt',
    'meetingId',
    'pinned',
    'pinnedParentId'
  ] as const
  type AgendaItem = {
    [K in (typeof PG_COLS)[number]]: any
  }
  const BATCH_SIZE = Math.trunc(MAX_PG_PARAMS / PG_COLS.length)

  let curUpdatedAt = r.minval
  let curId = r.minval
  for (let i = 0; i < 1e6; i++) {
    console.log('inserting row', i * BATCH_SIZE, String(curUpdatedAt), String(curId))
    const rawRowsToInsert = (await r
      .table('AgendaItem')
      .between([curUpdatedAt, curId], [r.maxval, r.maxval], {
        index: 'updatedAtId',
        leftBound: 'open',
        rightBound: 'closed'
      })
      .orderBy({index: 'updatedAtId'})
      .limit(BATCH_SIZE)
      .pluck(...PG_COLS)
      .run()) as AgendaItem[]

    const rowsToInsert = rawRowsToInsert.map((row) => {
      const {sortOrder, ...rest} = row as any
      return {
        ...rest,
        sortOrder: String(sortOrder)
      }
    })
    if (rowsToInsert.length === 0) break
    const lastRow = rowsToInsert[rowsToInsert.length - 1]
    curUpdatedAt = lastRow.updatedAt
    curId = lastRow.id
    try {
      await pg
        .insertInto('AgendaItem')
        .values(rowsToInsert)
        .onConflict((oc) => oc.doNothing())
        .execute()
    } catch (e) {
      await Promise.all(
        rowsToInsert.map(async (row) => {
          try {
            await pg
              .insertInto('AgendaItem')
              .values(row)
              .onConflict((oc) => oc.doNothing())
              .execute()
          } catch (e) {
            if (e.constraint === 'fk_teamMemberId' || e.constraint === 'fk_teamId') {
              console.log(`Skipping ${row.id} because it has no user/team`)
              return
            }
            console.log(e, row)
          }
        })
      )
    }
  }

  // remap the sortOrder in PG because rethinkdb is too slow to group
  const pgRows = await sql<{items: {sortOrder: string; id: string}[]}>`
    select jsonb_agg(jsonb_build_object('sortOrder', "sortOrder", 'id', "id", 'meetingId', "meetingId", 'teamId', "teamId") ORDER BY "sortOrder") items from "AgendaItem"
group by "teamId", "meetingId";`.execute(pg)

  const groups = pgRows.rows.map((row) => {
    const {items} = row
    let curSortOrder = ''
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      curSortOrder = positionAfter(curSortOrder)
      item.sortOrder = curSortOrder
    }
    return row
  })
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i]
    await Promise.all(
      group.items.map((item) => {
        return pg
          .updateTable('AgendaItem')
          .set({sortOrder: item.sortOrder})
          .where('id', '=', item.id)
          .execute()
      })
    )
  }
}

export async function down() {
  // await connectRethinkDB()
  // try {
  //   await r.table('AgendaItem').indexDrop('updatedAtId').run()
  // } catch {
  //   // index already dropped
  // }
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })
  await sql`TRUNCATE TABLE "AgendaItem" CASCADE`.execute(pg)
}
