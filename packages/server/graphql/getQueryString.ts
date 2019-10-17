import getRethink from '../database/rethinkDriver'

const cachedQueryStrings = {}
const getQueryString = async (hash: string) => {
  const cachedResult = cachedQueryStrings[hash]
  if (cachedResult) return cachedResult
  const r = await getRethink()
  return r
    .table('QueryMap')
    .get(hash)('query')
    .default(null)
    .run()
}

export default getQueryString
