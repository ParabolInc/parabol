import {FirstParam} from 'parabol-client/types/generics'
import {Client} from 'pg'
import pgpInit from 'pg-promise'
import {r} from 'rethinkdb-ts'
import {ParabolR} from '../../database/rethinkDriver'
import getPgConfig from '../getPgConfig'

const connectRethinkDB = async () => {
  const {hostname: host, port, pathname} = new URL(process.env.RETHINKDB_URL!)
  await r.connectPool({
    host,
    port: parseInt(port, 10),
    db: pathname.split('/')[1]
  })
  return r as any as ParabolR
}
export async function up() {
  await connectRethinkDB()
  const pgp = pgpInit()
  const pg = pgp(getPgConfig())
  const batchSize = 1000
  // Create an index we can paginate on
  try {
    await r.table('MeetingTemplate').indexCreate('updatedAt').run()
    await r.table('MeetingTemplate').indexWait().run()
  } catch {}

  const columnSet = new pgp.helpers.ColumnSet(
    [
      'id',
      'createdAt',
      'isActive',
      'name',
      'teamId',
      'updatedAt',
      'scope',
      'orgId',
      {name: 'parentTemplateId', def: null},
      {name: 'lastUsedAt', def: null},
      'type',
      {name: 'isStarter', def: false},
      {name: 'isFree', def: false}
    ],
    {table: 'MeetingTemplate'}
  )

  const getNextData = async (leftBoundCursor: Date | undefined) => {
    const startAt = leftBoundCursor || r.minval
    const nextBatch = await r
      .table('MeetingTemplate')
      // make sure leftBound is open so we don't get the same thing twice
      // good for efficiency, but mostly because that could cause an infinite loop on the last batch
      .between(startAt, r.maxval, {index: 'updatedAt', leftBound: 'open'})
      .orderBy({index: 'updatedAt'})
      .limit(batchSize)
      .run()
    // this is the last one, we know the updatedAt bucket isn't split (i.e. we know no other pending items share the same updatedAt)
    if (nextBatch.length === 0) return null
    // probably the 2nd to last batch. New updates may occur between now & the next time this gets called though!
    if (nextBatch.length < batchSize) return nextBatch
    // find the last complete bucket for updatedAt
    const lastItem = nextBatch.pop()
    const lastMatchingUpdatedAt = nextBatch.findLastIndex(
      (item) => item.updatedAt !== lastItem.updatedAt
    )
    if (lastMatchingUpdatedAt === -1) {
      throw new Error(
        'batchSize is smaller than the number of items that share the same cursor. Increase batchSize'
      )
    }
    return nextBatch.slice(0, lastMatchingUpdatedAt + 1)
  }

  await pg.tx('meetingTemplateTable', (task) => {
    const fetchAndProcess: FirstParam<typeof task.sequence> = async (
      _index,
      leftBoundCursor: undefined | Date
    ) => {
      const nextData = await getNextData(leftBoundCursor)
      if (!nextData) return undefined
      const insert = pgp.helpers.insert(nextData, columnSet)
      const update = ` ON CONFLICT(id) DO UPDATE SET
          "isActive" = EXCLUDED."isActive",
          "name" = EXCLUDED."name",
          "teamId" = EXCLUDED."teamId",
          "updatedAt" = EXCLUDED."updatedAt",
          "scope" = EXCLUDED."scope",
          "orgId" = EXCLUDED."orgId",
          "lastUsedAt" = EXCLUDED."lastUsedAt"`
      const upsert = insert + update
      await task.none(upsert)
      return nextData.at(-1).updatedAt
    }
    return task.sequence(fetchAndProcess)
  })
  await r.getPoolMaster()?.drain()
}

export async function down() {
  await connectRethinkDB()
  await r.table('MeetingTemplate').indexDrop('updatedAt').run()

  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`DELETE FROM "MeetingTemplate"`)
  await client.end()
}
