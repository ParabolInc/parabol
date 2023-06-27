import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import fs from 'fs'
import getRethink from 'parabol-server/database/rethinkDriver'
import path from 'path'
import getProjectRoot from '../webpack/utils/getProjectRoot'
import primeIntegrations from './primeIntegrations'
import pushToCDN from './pushToCDN'

const PROJECT_ROOT = getProjectRoot()!

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
  const res = await r.table('QueryMap').insert(records, {conflict: 'replace'}).run()
  console.log(`Added ${res.inserted} records to the queryMap`)
}

const preDeploy = async () => {
  const envPath = path.join(PROJECT_ROOT, '.env')
  const myEnv = dotenv.config({path: envPath})
  dotenvExpand(myEnv)

  try {
    const r = await getRethink()
    await storePersistedQueries()
    await r.getPoolMaster()?.drain()
    await Promise.all([primeIntegrations(), pushToCDN()])
  } catch (e) {
    console.log('Post deploy error', e)
  }

  process.exit()
}

preDeploy()
