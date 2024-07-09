import {Kysely, PostgresDialect, sql} from 'kysely'
import {r} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'
import getPg from '../getPg'

const toCreditCard = (creditCard: any) => {
  if (!creditCard) return null
  return sql<string>`(select json_populate_record(null::"CreditCard", ${JSON.stringify(creditCard)}))`
}

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
      .table('Organization')
      .indexCreate('updatedAtId', (row: any) => [row('updatedAt'), row('id')])
      .run()
    await r.table('Organization').indexWait().run()
  } catch {
    // index already exists
  }
  console.log('Adding index complete')
  const MAX_PG_PARAMS = 65545
  const PG_COLS = [
    'id',
    'activeDomain',
    'isActiveDomainTouched',
    'creditCard',
    'createdAt',
    'name',
    'payLaterClickCount',
    'periodEnd',
    'periodStart',
    'picture',
    'showConversionModal',
    'stripeId',
    'stripeSubscriptionId',
    'upcomingInvoiceEmailSentAt',
    'tier',
    'tierLimitExceededAt',
    'trialStartDate',
    'scheduledLockAt',
    'lockedAt',
    'updatedAt',
    'featureFlags'
  ] as const
  type Organization = {
    [K in (typeof PG_COLS)[number]]: any
  }
  const BATCH_SIZE = Math.trunc(MAX_PG_PARAMS / PG_COLS.length)

  let curUpdatedAt = r.minval
  let curId = r.minval
  for (let i = 0; i < 1e6; i++) {
    console.log('inserting row', i * BATCH_SIZE, curUpdatedAt, curId)
    const rawRowsToInsert = (await r
      .table('Organization')
      .between([curUpdatedAt, curId], [r.maxval, r.maxval], {
        index: 'updatedAtId',
        leftBound: 'open',
        rightBound: 'closed'
      })
      .orderBy({index: 'updatedAtId'})
      .limit(BATCH_SIZE)
      .pluck(...PG_COLS)
      .run()) as Organization[]

    const rowsToInsert = rawRowsToInsert.map((row) => ({
      ...row,
      activeDomain: row.activeDomain?.slice(0, 100) ?? null,
      name: row.name.slice(0, 100),
      creditCard: toCreditCard(row.creditCard)
    }))
    if (rowsToInsert.length === 0) break
    const lastRow = rowsToInsert[rowsToInsert.length - 1]
    curUpdatedAt = lastRow.updatedAt
    curId = lastRow.id
    try {
      await pg
        .insertInto('Organization')
        .values(rowsToInsert)
        .onConflict((oc) => oc.doNothing())
        .execute()
    } catch (e) {
      await Promise.all(
        rowsToInsert.map(async (row) => {
          try {
            await pg
              .insertInto('Organization')
              .values(row)
              .onConflict((oc) => oc.doNothing())
              .execute()
          } catch (e) {
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
    await r.table('Organization').indexDrop('updatedAtId').run()
  } catch {
    // index already dropped
  }
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })
  await pg.deleteFrom('Organization').execute()
}
