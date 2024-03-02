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
    await r.table('FailedAuthRequest').indexCreate('time').run()
    await r.table('FailedAuthRequest').indexWait().run()
  } catch {}

  const columnSet = new pgp.helpers.ColumnSet(['email', 'ip', 'time'], {table: 'FailedAuthRequest'})

  const getNextData = async (leftBoundCursor: Date | undefined) => {
    const startAt = leftBoundCursor || r.minval
    const nextBatch = await r
      .table('FailedAuthRequest')
      .between(startAt, r.maxval, {index: 'time', leftBound: 'open'})
      .orderBy({index: 'time'})
      .limit(batchSize)
      .run()
    if (nextBatch.length === 0) return null
    if (nextBatch.length < batchSize) return nextBatch
    const lastItem = nextBatch.pop()
    const lastMatchingTime = nextBatch.findLastIndex((item) => item.time !== lastItem!.time)
    if (lastMatchingTime === -1) {
      throw new Error(
        'batchSize is smaller than the number of items that share the same cursor. Increase batchSize'
      )
    }
    return nextBatch.slice(0, lastMatchingTime)
  }

  await pg.tx('FailedAuthRequest', (task) => {
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
  await client.query(`DELETE FROM "FailedAuthRequest"`)
  await client.end()
  try {
    await r.table('FailedAuthRequest').indexDrop('time').run()
  } catch {}
}
