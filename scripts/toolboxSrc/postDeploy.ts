import fs from 'fs'
import path from 'path'
import getRethink from '../../packages/server/database/rethinkDriver'
import getProjectRoot from '../webpack/utils/getProjectRoot'
import getRedis from '../../packages/server/utils/getRedis'

const PROJECT_ROOT = getProjectRoot()
const redis = getRedis()

const flushSocketConnections = async () => {
  const userPresenceStream = redis.scanStream({match: 'presence:*'})
  userPresenceStream.on('data', async (keys) => {
    if (!keys?.length) return
    userPresenceStream.pause()
    const writes = keys.map((key) => {
      return ['del', key]
    })
    await redis.multi(writes).exec((err, res) => console.log('RES', res))
    userPresenceStream.resume()
  })

  const onlineTeamsStream = redis.scanStream({match: 'team:*'})
  onlineTeamsStream.on('data', async (keys) => {
    if (!keys?.length) return
    onlineTeamsStream.pause()
    const writes = keys.map((key) => {
      return ['del', key]
    })
    await redis.multi(writes).exec((err, res) => console.log('RES', res))
    onlineTeamsStream.resume()
  })
}

const storePersistedQueries = async () => {
  const queryMap = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'queryMap.json')).toString())
  const hashes = Object.keys(queryMap)
  const now = new Date()
  const records = hashes.map((hash) => ({
    id: hash,
    query: queryMap[hash],
    createdAt: now
  }))

  const r = await getRethink()
  const res = await r
    .table('QueryMap')
    .insert(records, {conflict: 'replace'})
    .run()
  console.log(`Added ${res.inserted} records to the queryMap`)
}

const postDeploy = async () => {
  try {
    const r = await getRethink()
    await flushSocketConnections()
    await storePersistedQueries()
    await r.getPoolMaster().drain()
  } catch (e) {
    console.log('Post deploy error', e)
  }

  process.exit()
}

postDeploy()
