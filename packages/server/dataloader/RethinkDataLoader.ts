import fkLoader from './fkLoader'
import DataLoader from 'dataloader'
import pkLoader from './pkLoader'
import * as primaryLoaderMakers from './primaryLoaderMakers'
import * as customLoaderMakers from './customLoaderMakers'
import * as foreignLoaderMakers from './foreignLoaderMakers'
import {DataLoaderType} from 'parabol-client/types/constEnums'

interface LoaderDict {
  [loaderName: string]: DataLoader<any, any>
}

const loaderMakers = {
  ...primaryLoaderMakers,
  ...foreignLoaderMakers,
  ...customLoaderMakers
} as const

export default class RethinkDataLoader {
  dataLoaderOptions: DataLoader.Options<any, any>
  loaders: LoaderDict = {}
  constructor(dataLoaderOptions: DataLoader.Options<any, any> = {}) {
    this.dataLoaderOptions = dataLoaderOptions
  }

  get(loaderName: keyof typeof loaderMakers) {
    const loader = this.loaders[loaderName]
    if (loader) return loader
    const loaderMaker = loaderMakers[loaderName]
    const {type} = loaderMaker
    switch (type) {
      case DataLoaderType.PRIMARY:
        const {table} = loaderMaker
        return (this.loaders[loaderName] = pkLoader(this.dataLoaderOptions, table))
      case DataLoaderType.FOREIGN:
        const {fetch, field, pk} = loaderMaker
        const basePkLoader = this.get(pk)
        return (this.loaders[loaderName] = fkLoader(
          basePkLoader,
          this.dataLoaderOptions,
          field,
          fetch
        ))
      case DataLoaderType.CUSTOM:
        const {fn} = loaderMaker
        return (this.loaders[loaderName] = fn(this))
    }
  }
}
