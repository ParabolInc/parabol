import fs from 'fs'
import path from 'path'
import getRethink from '../../packages/server/database/rethinkDriver'
import getProjectRoot from '../webpack/utils/getProjectRoot'
import getRedis from '../../packages/server/utils/getRedis'

const PROJECT_ROOT = getProjectRoot()
const redis = getRedis()

const flushSocketConnections = async () => {
  const onlineUserIds = await redis.smembers('onlineUserIds')
  for (const userId of onlineUserIds) {
    await redis.del(`presence:${userId}`)
  }
  const onlineTeamIds = await redis.smembers('onlineTeamIds')
  for (const teamId of onlineTeamIds) {
    await redis.del(`team:${teamId}`)
  }
  await redis.del('onlineUserIds')
  await redis.del('onlineTeamIds')
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
