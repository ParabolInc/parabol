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

  // add a dummy date for nulls
  const parabolEpoch = new Date('2016-06-01')
  await r
    .table('TeamMember')
    .update((row) => ({
      updatedAt: row('updatedAt').default(parabolEpoch),
      createdAt: row('createdAt').default(parabolEpoch)
    }))
    .run()
  const strDates = await r
    .table('TeamMember')
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
        .table('TeamMember')
        .get(row('id'))
        .update({updatedAt: row('updatedAt')})
    })
    .run()

  try {
    console.log('Adding index')
    await r
      .table('TeamMember')
      .indexCreate('updatedAtId', (row: any) => [row('updatedAt'), row('id')])
      .run()
    await r.table('TeamMember').indexWait().run()
  } catch {
    // index already exists
  }

  await console.log('Adding index complete')
  const MAX_PG_PARAMS = 65545
  const PG_COLS = [
    'id',
    'isNotRemoved',
    'isLead',
    'isSpectatingPoker',
    'email',
    'openDrawer',
    'picture',
    'preferredName',
    'teamId',
    'userId',
    'createdAt',
    'updatedAt'
  ] as const
  type TeamMember = {
    [K in (typeof PG_COLS)[number]]: any
  }
  const BATCH_SIZE = Math.trunc(MAX_PG_PARAMS / PG_COLS.length)

  let curUpdatedAt = r.minval
  let curId = r.minval
  for (let i = 0; i < 1e6; i++) {
    console.log('inserting row', i * BATCH_SIZE, String(curUpdatedAt), String(curId))
    const rawRowsToInsert = (await r
      .table('TeamMember')
      .between([curUpdatedAt, curId], [r.maxval, r.maxval], {
        index: 'updatedAtId',
        leftBound: 'open',
        rightBound: 'closed'
      })
      .orderBy({index: 'updatedAtId'})
      .limit(BATCH_SIZE)
      .pluck(...PG_COLS)
      .run()) as TeamMember[]

    const rowsToInsert = rawRowsToInsert.map((row) => {
      const {preferredName, picture, ...rest} = row as any
      return {
        ...rest,
        preferredName: preferredName.slice(0, 100),
        picture: picture.slice(0, 2056)
      }
    })
    if (rowsToInsert.length === 0) break
    const lastRow = rowsToInsert[rowsToInsert.length - 1]
    curUpdatedAt = lastRow.updatedAt
    curId = lastRow.id
    try {
      await pg
        .insertInto('TeamMember')
        .values(rowsToInsert)
        .onConflict((oc) => oc.doNothing())
        .execute()
    } catch (e) {
      await Promise.all(
        rowsToInsert.map(async (row) => {
          try {
            await pg
              .insertInto('TeamMember')
              .values(row)
              .onConflict((oc) => oc.doNothing())
              .execute()
          } catch (e) {
            if (e.constraint === 'fk_userId' || e.constraint === 'fk_teamId') {
              console.log(`Skipping ${row.id} because it has no user/team`)
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
    await r.table('TeamMember').indexDrop('updatedAtId').run()
  } catch {
    // index already dropped
  }
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })
  await pg.deleteFrom('TeamMember').execute()
}
