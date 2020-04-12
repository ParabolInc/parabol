import getRethink from '../database/rethinkDriver'

const flushSocketConnections = async () => {
  const r = await getRethink()
  return r
    .table('User')
    .update({
      connectedSockets: []
    })
    .run()
}

const storePersistedQueries = async () => {
  const queryMap = require('../graphql/queryMap.json')
  const hashes = Object.keys(queryMap)
  const records = hashes.map((hash) => ({
    id: hash,
    query: queryMap[hash]
  }))

  const r = await getRethink()
  const res = await r
    .table('QueryMap')
    .insert(records, {conflict: 'replace'})
    .run()
  console.log(`Added ${res.inserted} records to the queryMap`)
}

const postDeploy = async () => {
  const r = await getRethink()
  await flushSocketConnections()
  await storePersistedQueries()
  await r.getPoolMaster().drain()
  process.exit()
}

export default postDeploy
