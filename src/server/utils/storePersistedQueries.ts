import getRethink from 'server/database/rethinkDriver'
import * as fs from 'fs'
import * as path from 'path'

const filePath = path.join(__dirname, '../graphql')
const fileName = 'queryMap.json'
const fullPath = path.join(filePath, fileName)
const storePersistedQueries = async () => {
  const watcher = fs.watch(filePath, async (_event, file) => {
    if (file !== 'queryMap.json') return
    watcher.close()
    const queryMap = require(fullPath)
    const hashes = Object.keys(queryMap)
    const records = hashes.map((hash) => ({
      id: hash,
      query: queryMap[hash]
    }))

    const r = getRethink()
    const res = await r.table('QueryMap').insert(records)
    r.getPoolMaster().drain()
    fs.unlinkSync('src/server/graphql/queryMap.json')
    console.log(`Added ${res.inserted} records to the queryMap`)
  })
}

storePersistedQueries().catch()
