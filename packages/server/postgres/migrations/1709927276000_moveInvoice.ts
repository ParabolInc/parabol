import {FirstParam} from 'parabol-client/types/generics'
import {Client} from 'pg'
import {r} from 'rethinkdb-ts'
import getPgConfig from '../getPgConfig'
import connectRethinkDB from '../../database/connectRethinkDB'
import getPgp from '../getPgp'

export async function up() {
  await connectRethinkDB()
  const {pgp, pg} = getPgp()
  const batchSize = 1000

  try {
    await r.table('Invoice').indexCreate('startAt').run()
    await r.table('Invoice').indexWait().run()
  } catch {}

  const columnSet = new pgp.helpers.ColumnSet(
    [
      'id',
      'amountDue',
      'createdAt',
      {name: 'coupon', def: null},
      'total',
      'billingLeaderEmails',
      {name: 'creditCard', def: null},
      'endAt',
      'invoiceDate',
      {name: 'lines', cast: 'jsonb[]'},
      'nextPeriodCharges',
      'orgId',
      'orgName',
      {name: 'payUrl', def: null},
      {name: 'picture', def: null},
      'startAt',
      'startingBalance',
      'status',
      'tier'
    ],
    {table: 'Invoice'}
  )

  const getNextData = async (leftBoundCursor: Date | undefined) => {
    const startAt = leftBoundCursor || r.minval
    const nextBatch = await r
      .table('Invoice')
      .between(startAt, r.maxval, {index: 'startAt', leftBound: 'open'})
      .orderBy({index: 'startAt'})
      .limit(batchSize)
      .run()
    if (nextBatch.length === 0) return null
    if (nextBatch.length < batchSize) return nextBatch
    const lastItem = nextBatch.pop()
    const lastMatchingStartAt = nextBatch.findLastIndex(
      (item) => item.startAt !== lastItem!.startAt
    )
    if (lastMatchingStartAt === -1) {
      throw new Error(
        'batchSize is smaller than the number of items that share the same cursor. Increase batchSize'
      )
    }
    return nextBatch.slice(0, lastMatchingStartAt)
  }

  await pg.tx('Invoice', (task) => {
    const fetchAndProcess: FirstParam<typeof task.sequence> = async (
      _index,
      leftBoundCursor: undefined | Date
    ) => {
      const nextData = await getNextData(leftBoundCursor)
      if (!nextData) return undefined
      const insert = pgp.helpers.insert(nextData, columnSet)
      await task.none(insert)
      return nextData.at(-1)!.startAt
    }
    return task.sequence(fetchAndProcess)
  })
  await r.getPoolMaster()?.drain()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`DELETE FROM "Invoice"`)
  await client.end()
  try {
    await r.table('Invoice').indexDrop('startAt').run()
  } catch {}
}
