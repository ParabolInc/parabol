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

// client.query(
//     `INSERT INTO mytable (name, info)
//      SELECT name, info FROM jsonb_to_recordset($1::jsonb) AS t (name text, info int[])`,
//     [
//         JSON.stringify([
//             {name: "John", info: [1, 2, 3, 4]},
//             {name: "Adam", info: [2, 3, 5, 4]},
//             {name: "Mark", info: [4, 4, 5, 8]},
//         ]),
//     ]
// )

// await client.query(
//   `INSERT INTO "MeetingTemplate" (id, name, "teamId", "orgId", "parentTemplateId", type, scope, "lastUsedAt", "isStarter", "isFree") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
//   [id, name, teamId, orgId, parentTemplateId, type, scope, lastUsedAt, isStarter, isFree]
// )

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

  const getNextData = async (prevBatch: any[] | undefined) => {
    // prevBatch is undefined for the first batch
    const startAt = prevBatch ? prevBatch.at(-1).updatedAt : r.minval
    const nextBatch = await r
      .table('MeetingTemplate')
      .between(startAt, r.maxval, {index: 'updatedAt', leftBound: 'open'})
      .orderBy({index: 'updatedAt'})
      .limit(batchSize)
      .run()
    // this is the last one, we know the bucket isn't split (i.e. we know no other pending items share the same updatedAt)
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

  const commit = await pg.tx('meetingTemplateTable', (task) => {
    const processData = (data: undefined | any[]) => {
      if (!data) return null
      const insert = pgp.helpers.insert(data, columnSet) + ' ON CONFLICT DO NOTHING'
      return task.none(insert)
    }
    const fetchAndProcess: FirstParam<typeof task.sequence> = async (_index, prevBatch) => {
      const nextData = await getNextData(prevBatch)
      return processData(nextData)
    }
    return task.sequence(fetchAndProcess)
  })

  console.log('Commit total: ', (commit as any).total, 'Dur: ', commit.duration)

  await r.getPoolMaster()?.drain()
  console.log('all done')
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`` /* Do undo magic */)
  await client.end()
}
