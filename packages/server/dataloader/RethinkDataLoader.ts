import fkLoader from './fkLoader'
import DataLoader from 'dataloader'
import foreignParamDict from './foreignParamDict'
import pkLoader, {pkLoaderToTable} from './pkLoader'
import customLoaderFns from './customLoaderFns'

type PKLoaderName = keyof typeof pkLoaderToTable
type FKLoaderName = keyof typeof foreignParamDict
type CustomLoaderName = keyof typeof customLoaderFns
type LoaderName = PKLoaderName | FKLoaderName | CustomLoaderName

interface LoaderDict {
  [loaderName: string]: DataLoader<any, any>
}
export default class RethinkDataLoader {
  dataLoaderOptions: DataLoader.Options<any, any>
  primaryLoaders: LoaderDict = {}
  foreginLoaders: LoaderDict = {}
  customLoaders: LoaderDict = {}
  constructor(dataLoaderOptions: DataLoader.Options<any, any> = {}) {
    this.dataLoaderOptions = dataLoaderOptions
  }

  getPrimary(loaderName: PKLoaderName) {
    let loader = this.primaryLoaders[loaderName]
    if (!loader) {
      const table = pkLoaderToTable[loaderName]
      loader = this.primaryLoaders[loaderName] = pkLoader(this.dataLoaderOptions, table)
    }
    return loader
  }

  getForeign(loaderName: FKLoaderName) {
    let loader = this.foreginLoaders[loaderName]
    if (!loader) {
      const {fetch, field, pk} = foreignParamDict[loaderName]
      const pkLoader = this.getPrimary(pk)
      loader = this.foreginLoaders[loaderName] = fkLoader(
        pkLoader,
        this.dataLoaderOptions,
        field,
        fetch
      )
    }
    return loader
  }

  getCustom(loaderName: CustomLoaderName) {
    let loader = this.customLoaders[loaderName]
    if (!loader) {
      const loaderFn = customLoaderFns[loaderName]
      loader = this.customLoaders[loaderName] = loaderFn(this)
    }
    return loader
  }

  get(loaderName: LoaderName) {
    if (foreignParamDict[loaderName]) {
      return this.getForeign(loaderName as FKLoaderName)
    }
    if (pkLoaderToTable[loaderName]) {
      return this.getPrimary(loaderName as PKLoaderName)
    }
    return this.getCustom(loaderName as CustomLoaderName)
  }
}
