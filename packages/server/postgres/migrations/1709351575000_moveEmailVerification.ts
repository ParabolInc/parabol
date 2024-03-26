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
    await r.table('EmailVerification').indexCreate('expiration').run()
    await r.table('EmailVerification').indexWait().run()
  } catch {}

  const columnSet = new pgp.helpers.ColumnSet(
    [
      'email',
      'expiration',
      'hashedPassword',
      'token',
      {name: 'invitationToken', def: null},
      {name: 'pseudoId', def: null}
    ],
    {table: 'EmailVerification'}
  )

  const getNextData = async (leftBoundCursor: Date | undefined) => {
    const expiration = leftBoundCursor || r.minval
    const nextBatch = await r
      .table('EmailVerification')
      .between(expiration, r.maxval, {index: 'expiration', leftBound: 'open'})
      .orderBy({index: 'expiration'})
      .limit(batchSize)
      .run()
    if (nextBatch.length === 0) return null
    if (nextBatch.length < batchSize) return nextBatch
    const lastItem = nextBatch.pop()
    const lastMatchingExpiration = nextBatch.findLastIndex(
      (item) => item.expiration !== lastItem!.expiration
    )
    if (lastMatchingExpiration === -1) {
      throw new Error(
        'batchSize is smaller than the number of items that share the same cursor. Increase batchSize'
      )
    }
    return nextBatch.slice(0, lastMatchingExpiration)
  }

  await pg.tx('EmailVerification', (task) => {
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
  await client.query(`DELETE FROM "EmailVerification"`)
  await client.end()
  try {
    await r.table('EmailVerification').indexDrop('expiration').run()
  } catch {}
}
