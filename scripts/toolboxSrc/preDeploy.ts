import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import fs from 'fs'
import path from 'path'
import getRethink from '../../packages/server/database/rethinkDriver'
import getProjectRoot from '../webpack/utils/getProjectRoot'
import primeIntegrations from './primeIntegrations'
import pushToCDN from './pushToCDN'
import standaloneMigrations from './standaloneMigrations'

const PROJECT_ROOT = getProjectRoot()!

const storePersistedQueries = async () => {
  console.log('🔗 QueryMap Persistence Started')
  const queryMap = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'queryMap.json')).toString())
  const hashes = Object.keys(queryMap)
  const now = new Date()
  const records = hashes.map((hash) => ({
    id: hash,
    query: queryMap[hash],
    createdAt: now
  }))

  const r = await getRethink()
  const res = await r.table('QueryMap').insert(records, {conflict: 'replace'}).run()
  await r.getPoolMaster()?.drain()

  console.log(`🔗 QueryMap Persistence Complete: ${res.inserted} records added`)
}

const preDeploy = async () => {
  const envPath = path.join(PROJECT_ROOT, '.env')
  const myEnv = dotenv.config({path: envPath})
  dotenvExpand(myEnv)

  // first we migrate DBs
  await standaloneMigrations()

  // The we can prime the DB & CDN
  await Promise.all([storePersistedQueries(), primeIntegrations(), pushToCDN()])

  process.exit()
}

preDeploy()
