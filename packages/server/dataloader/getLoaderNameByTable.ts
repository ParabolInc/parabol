import * as rethinkPrimaryKeyLoaderMakers from './rethinkPrimaryKeyLoaderMakers'

const loadersByTable = {}
Object.keys(rethinkPrimaryKeyLoaderMakers).forEach((loaderName) => {
  const loader = rethinkPrimaryKeyLoaderMakers[loaderName]
  loadersByTable[loader.table] = loaderName
})

const getLoaderNameByTable = (table: string) => {
  return loadersByTable[table]
}

export default getLoaderNameByTable
