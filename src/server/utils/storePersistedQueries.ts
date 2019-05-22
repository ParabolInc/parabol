import getRethink from 'server/database/rethinkDriver'
import * as fs from 'fs'
import * as path from 'path'

const filePath = path.join(__dirname, '../graphql')
const fileName = 'queryMap.json'
const fullPath = path.join(filePath, fileName)
const storePersistedQueries = async () => {
  const watcher = fs.watch(filePath, async (_event, file) => {
    if (file !== 'queryMap.json') return
    let queryMap
    try {
      queryMap = require(fullPath)
    } catch (e) {
      // make sure the file isn't empty
      return
    }
    watcher.close()
    const hashes = Object.keys(queryMap)
    const records = hashes.map((hash) => ({
      id: hash,
      query: queryMap[hash]
    }))

    const r = getRethink()
    // replace because relay doesn't create a unique hash >:-(
    const res = await r.table('QueryMap').insert(records, {conflict: 'replace'})
    r.getPoolMaster().drain()
    fs.unlinkSync('src/server/graphql/queryMap.json')
    console.log(`Added ${res.inserted} records to the queryMap`)
  })
}

storePersistedQueries().catch()
