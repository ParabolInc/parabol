import {FirstParam} from 'parabol-client/types/generics'
import {Client} from 'pg'
import {r} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'
import getPgConfig from '../getPgConfig'
import getPgp from '../getPgp'

export async function up() {
  await connectRethinkDB()
  const {pgp, pg} = getPgp()
  const batchSize = 1000

  const columnSet = new pgp.helpers.ColumnSet(
    ['runAt', 'type', {name: 'orgId', def: null}, {name: 'meetingId', def: null}],
    {table: 'ScheduledJob'}
  )

  const getNextData = async (leftBoundCursor: Date | undefined) => {
    const startAt = leftBoundCursor || r.minval
    const nextBatch = await r
      .table('ScheduledJob')
      .between(startAt, r.maxval, {index: 'runAt', leftBound: 'open'})
      .orderBy({index: 'runAt'})
      .limit(batchSize)
      .run()
    if (nextBatch.length === 0) return null
    if (nextBatch.length < batchSize) return nextBatch
    const lastItem = nextBatch.pop()
    const lastMatchingRunAt = nextBatch.findLastIndex((item) => item.runAt !== lastItem!.runAt)
    if (lastMatchingRunAt === -1) {
      throw new Error(
        'batchSize is smaller than the number of items that share the same cursor. Increase batchSize'
      )
    }
    return nextBatch.slice(0, lastMatchingRunAt)
  }

  await pg.tx('ScheduledJob', (task) => {
    const fetchAndProcess: FirstParam<typeof task.sequence> = async (
      _index,
      leftBoundCursor: undefined | Date
    ) => {
      const nextData = await getNextData(leftBoundCursor)
      if (!nextData) return undefined
      const insert = pgp.helpers.insert(nextData, columnSet)
      await task.none(insert)
      return nextData.at(-1)!.runAt
    }
    return task.sequence(fetchAndProcess)
  })
  await r.getPoolMaster()?.drain()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`DELETE FROM "ScheduledJob"`)
  await client.end()
}
