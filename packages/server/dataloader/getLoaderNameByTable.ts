import * as rethinkPrimaryKeyLoaderMakers from './rethinkPrimaryKeyLoaderMakers'

const loadersByTable = {} as Record<string, any>
Object.keys(rethinkPrimaryKeyLoaderMakers).forEach((loaderName) => {
  const loader =
    rethinkPrimaryKeyLoaderMakers[loaderName as keyof typeof rethinkPrimaryKeyLoaderMakers]
  loadersByTable[loader.table] = loaderName
})

const getLoaderNameByTable = (table: string) => {
  return loadersByTable[table]
}

export default getLoaderNameByTable
