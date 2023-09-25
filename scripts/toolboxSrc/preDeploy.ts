import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import path from 'path'
import getRethink from '../../packages/server/database/rethinkDriver'
import queryMap from '../../queryMap.json'
import getProjectRoot from '../webpack/utils/getProjectRoot'
import {applyEnvVarsToClientAssets} from './applyEnvVarsToClientAssets'
import primeIntegrations from './primeIntegrations'
import pushToCDN from './pushToCDN'
import standaloneMigrations from './standaloneMigrations'

const PROJECT_ROOT = getProjectRoot()

const storePersistedQueries = async () => {
  console.log('🔗 QueryMap Persistence Started')
  const hashes = Object.keys(queryMap)
  const now = new Date()
  const records = hashes.map((hash) => ({
    id: hash,
    query: queryMap[hash as keyof typeof queryMap],
    createdAt: now
  }))

  const r = await getRethink()
  const res = await r.table('QueryMap').insert(records, {conflict: 'replace'}).run()
  // without this sleep RethinkDB closes the connection before the query completes. It doesn't make sense!
  await new Promise((resolve) => setTimeout(resolve, 50))
  await r.getPoolMaster()?.drain()

  console.log(`🔗 QueryMap Persistence Complete: ${res.inserted} records added`)
}

const preDeploy = async () => {
  // .env is typically only used in testing prod deploys
  const envPath = path.join(PROJECT_ROOT, '.env')
  const myEnv = dotenv.config({path: envPath})
  dotenvExpand(myEnv)
  console.log(`🚀 Predeploy Started v${__APP_VERSION__} sha:${__COMMIT_HASH__}`)
  // first we migrate DBs & add env vars to client assets
  await Promise.all([standaloneMigrations(), applyEnvVarsToClientAssets()])

  // The we can prime the DB & CDN
  await Promise.all([storePersistedQueries(), primeIntegrations(), pushToCDN()])
  console.log(`🚀 Predeploy Complete`)
  process.exit()
}

preDeploy()
