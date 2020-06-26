import * as primaryLoaderMakers from './primaryLoaderMakers'

const loadersByTable = {}
Object.keys(primaryLoaderMakers).forEach((loaderName) => {
  const loader = primaryLoaderMakers[loaderName]
  loadersByTable[loader.table] = loaderName
})

const getLoaderNameByTable = (table: string) => {
  return loadersByTable[table]
}

export default getLoaderNameByTable
