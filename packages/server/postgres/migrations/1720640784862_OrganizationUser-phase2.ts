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
      .table('OrganizationUser')
      .indexCreate('joinedAtId', (row: any) => [row('joinedAt'), row('id')])
      .run()
    await r.table('OrganizationUser').indexWait().run()
  } catch {
    // index already exists
  }
  await r.table('OrganizationUser').get('aGhostOrganizationUser').update({tier: 'enterprise'}).run()
  await console.log('Adding index complete')
  const MAX_PG_PARAMS = 65545
  const PG_COLS = [
    'id',
    'suggestedTier',
    'inactive',
    'joinedAt',
    'orgId',
    'removedAt',
    'role',
    'userId',
    'tier',
    'trialStartDate'
  ] as const
  type OrganizationUser = {
    [K in (typeof PG_COLS)[number]]: any
  }
  const BATCH_SIZE = Math.trunc(MAX_PG_PARAMS / PG_COLS.length)

  let curjoinedAt = r.minval
  let curId = r.minval
  for (let i = 0; i < 1e6; i++) {
    console.log('inserting row', i * BATCH_SIZE, curjoinedAt, curId)
    const rawRowsToInsert = (await r
      .table('OrganizationUser')
      .between([curjoinedAt, curId], [r.maxval, r.maxval], {
        index: 'joinedAtId',
        leftBound: 'open',
        rightBound: 'closed'
      })
      .orderBy({index: 'joinedAtId'})
      .limit(BATCH_SIZE)
      .pluck(...PG_COLS)
      .run()) as OrganizationUser[]

    const rowsToInsert = rawRowsToInsert.map((row) => {
      const {newUserUntil, ...rest} = row as any
      return {
        ...rest
      }
    })
    if (rowsToInsert.length === 0) break
    const lastRow = rowsToInsert[rowsToInsert.length - 1]
    curjoinedAt = lastRow.joinedAt
    curId = lastRow.id
    try {
      await pg
        .insertInto('OrganizationUser')
        .values(rowsToInsert)
        .onConflict((oc) => oc.doNothing())
        .execute()
    } catch (e) {
      await Promise.all(
        rowsToInsert.map(async (row) => {
          try {
            await pg
              .insertInto('OrganizationUser')
              .values(row)
              .onConflict((oc) => oc.doNothing())
              .execute()
          } catch (e) {
            if (e.constraint === 'fk_userId' || e.constraint === 'fk_orgId') {
              console.log(`Skipping ${row.id} because it has no user/org`)
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
    await r.table('OrganizationUser').indexDrop('joinedAtId').run()
  } catch {
    // index already dropped
  }
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })
  await pg.deleteFrom('OrganizationUser').execute()
}
