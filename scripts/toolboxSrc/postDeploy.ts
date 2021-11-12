import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import getPg from '../../packages/server/postgres/getPg'
import getRethink from '../../packages/server/database/rethinkDriver'
import getProjectRoot from '../webpack/utils/getProjectRoot'
import getRedis from '../../packages/server/utils/getRedis'
import sendToSentry from '../../packages/server/utils/sendToSentry'
import makeGlobalIntegrationProvidersFromEnv from '../../packages/server/utils/makeGlobalIntegrationProvidersFromEnv'
import upsertGlobalIntegrationProvider from '../../packages/server/postgres/queries/upsertGlobalIntegrationProvider'
import plural from 'parabol-client/utils/plural'

const PROJECT_ROOT = getProjectRoot()

const flushSocketConnections = async () => {
  const redis = getRedis()
  const userPresenceStream = redis.scanStream({match: 'presence:*'})
  userPresenceStream.on('data', (keys) => {
    if (!keys?.length) return
    const writes = keys.map((key) => {
      return ['del', key]
    })
    redis.multi(writes).exec()
  })
  await new Promise((resolve, reject) => {
    userPresenceStream.on('end', resolve)
    userPresenceStream.on('error', (e) => {
      sendToSentry(e)
      reject(e)
    })
  })

  const onlineTeamsStream = redis.scanStream({match: 'team:*'})
  onlineTeamsStream.on('data', (keys) => {
    if (!keys?.length) return
    const writes = keys.map((key) => {
      return ['del', key]
    })
    redis.multi(writes).exec()
  })
  await new Promise<void>((resolve, reject) => {
    onlineTeamsStream.on('end', () => {
      resolve()
    })
    onlineTeamsStream.on('error', (e) => {
      sendToSentry(e)
      reject(e)
    })
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

const upsertGlobalIntegrationProvidersFromEnv = async () => {
  let providers = []
  await Promise.all(
    makeGlobalIntegrationProvidersFromEnv().map((provider) => {
      providers.push(provider.type)
      return upsertGlobalIntegrationProvider(provider)
    })
  )
  console.log(
    `Upserted ${providers.length} global integration ${plural(providers.length, 'provider')}` +
      (providers.length ? `: ${providers.join(', ')}` : '')
  )
}

const postDeploy = async () => {
  const envPath = path.join(PROJECT_ROOT, '.env')
  const myEnv = dotenv.config({path: envPath})
  dotenvExpand(myEnv)

  try {
    const r = await getRethink()
    await flushSocketConnections()
    await storePersistedQueries()
    await r.getPoolMaster().drain()

    const pg = getPg()
    await upsertGlobalIntegrationProvidersFromEnv()
    await pg.end()
  } catch (e) {
    console.log('Post deploy error', e)
  }

  process.exit()
}

postDeploy()
