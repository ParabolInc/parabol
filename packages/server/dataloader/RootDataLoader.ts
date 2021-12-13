import DataLoader from 'dataloader'
import {DBType} from '../database/rethinkDriver'
import * as pollLoaders from './pollsLoaders'
import * as atlassianLoaders from './atlassianLoaders'
import * as customLoaderMakers from './customLoaderMakers'
import * as githubLoaders from './githubLoaders'
import * as integrationAuthLoaders from './integrationAuthLoaders'
import * as rethinkForeignKeyLoaderMakers from './rethinkForeignKeyLoaderMakers'
import * as rethinkPrimaryKeyLoaderMakers from './rethinkPrimaryKeyLoaderMakers'
import RethinkForeignKeyLoaderMaker from './RethinkForeignKeyLoaderMaker'
import RethinkPrimaryKeyLoaderMaker from './RethinkPrimaryKeyLoaderMaker'
import rethinkForeignKeyLoader from './rethinkForeignKeyLoader'
import rethinkPrimaryKeyLoader from './rethinkPrimaryKeyLoader'

interface LoaderDict {
  [loaderName: string]: DataLoader<any, any>
}

// Register all loaders
const loaderMakers = {
  ...rethinkForeignKeyLoaderMakers,
  ...rethinkPrimaryKeyLoaderMakers,
  ...customLoaderMakers,
  ...atlassianLoaders,
  ...customLoaderMakers,
  ...githubLoaders,
  ...integrationAuthLoaders,
  ...pollLoaders
} as const

type LoaderMakers = typeof loaderMakers
export type Loaders = keyof LoaderMakers

type PrimaryLoaderMakers = typeof rethinkPrimaryKeyLoaderMakers
type PrimaryLoaders = keyof PrimaryLoaderMakers
type Unprimary<T> = T extends RethinkPrimaryKeyLoaderMaker<infer U> ? DBType[U] : never
type TypeFromPrimary<T extends PrimaryLoaders> = Unprimary<PrimaryLoaderMakers[T]>

type ForeignLoaderMakers = typeof rethinkForeignKeyLoaderMakers
type ForeignLoaders = keyof ForeignLoaderMakers
type Unforeign<T> = T extends RethinkForeignKeyLoaderMaker<infer U> ? U : never
type TypeFromForeign<T extends ForeignLoaders> = TypeFromPrimary<Unforeign<ForeignLoaderMakers[T]>>

/**
 * When adding a new loaders file like {@link atlassianLoaders} or {@link githubLoaders}
 * this type has to include a typeof of newly added loaders
 */
type CustomLoaderMakers = typeof customLoaderMakers &
  typeof atlassianLoaders &
  typeof pollLoaders &
  typeof integrationAuthLoaders
type CustomLoaders = keyof CustomLoaderMakers
type Uncustom<T> = T extends (parent: RootDataLoader) => infer U ? U : never
type TypeFromCustom<T extends CustomLoaders> = Uncustom<CustomLoaderMakers[T]>

type TypedDataLoader<LoaderName> = LoaderName extends CustomLoaders
  ? TypeFromCustom<LoaderName>
  : DataLoader<
      string,
      LoaderName extends ForeignLoaders
        ? TypeFromForeign<LoaderName>[]
        : LoaderName extends PrimaryLoaders
        ? TypeFromPrimary<LoaderName>
        : never
    >

/**
 * This is the main dataloader
 */
export default class RootDataLoader {
  dataLoaderOptions: DataLoader.Options<any, any>
  loaders: LoaderDict = {}
  constructor(dataLoaderOptions: DataLoader.Options<any, any> = {}) {
    this.dataLoaderOptions = dataLoaderOptions
  }

  get<LoaderName extends Loaders>(loaderName: LoaderName) {
    let loader = this.loaders[loaderName]
    if (loader) return loader as TypedDataLoader<LoaderName>
    const loaderMaker = loaderMakers[loaderName]
    if (loaderMaker instanceof RethinkPrimaryKeyLoaderMaker) {
      const {table} = loaderMaker
      loader = rethinkPrimaryKeyLoader(this.dataLoaderOptions, table)
      this.loaders[loaderName]
    } else if (loaderMaker instanceof RethinkForeignKeyLoaderMaker) {
      const {fetch, field, pk} = loaderMaker
      const basePkLoader = this.get(pk as PrimaryLoaders)
      loader = rethinkForeignKeyLoader(basePkLoader, this.dataLoaderOptions, field, fetch)
    } else {
      loader = (loaderMaker as any)(this)
    }
    this.loaders[loaderName] = loader
    return loader as TypedDataLoader<LoaderName>
  }
}
