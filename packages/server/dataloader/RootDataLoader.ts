import DataLoader from 'dataloader'
import {DBType} from '../database/rethinkDriver'
import * as atlassianLoaders from './atlassianLoaders'
import * as azureDevOpsLoaders from './azureDevOpsLoaders'
import * as customLoaderMakers from './customLoaderMakers'
import * as foreignKeyLoaderMakers from './foreignKeyLoaderMakers'
import * as githubLoaders from './githubLoaders'
import * as gitlabLoaders from './gitlabLoaders'
import * as integrationAuthLoaders from './integrationAuthLoaders'
import * as jiraServerLoaders from './jiraServerLoaders'
import * as pollLoaders from './pollsLoaders'
import * as primaryKeyLoaderMakers from './primaryKeyLoaderMakers'
import rethinkForeignKeyLoader from './rethinkForeignKeyLoader'
import RethinkForeignKeyLoaderMaker from './RethinkForeignKeyLoaderMaker'
import * as rethinkForeignKeyLoaderMakers from './rethinkForeignKeyLoaderMakers'
import rethinkPrimaryKeyLoader from './rethinkPrimaryKeyLoader'
import RethinkPrimaryKeyLoaderMaker from './RethinkPrimaryKeyLoaderMaker'
import * as rethinkPrimaryKeyLoaderMakers from './rethinkPrimaryKeyLoaderMakers'
import UpdatableCacheDataLoader from './UpdatableCacheDataLoader'

interface LoaderDict {
  [loaderName: string]: DataLoader<any, any>
}

// Register all loaders
const loaderMakers = {
  ...rethinkForeignKeyLoaderMakers,
  ...rethinkPrimaryKeyLoaderMakers,
  ...primaryKeyLoaderMakers,
  ...foreignKeyLoaderMakers,
  ...customLoaderMakers,
  ...atlassianLoaders,
  ...jiraServerLoaders,
  ...customLoaderMakers,
  ...githubLoaders,
  ...gitlabLoaders,
  ...integrationAuthLoaders,
  ...pollLoaders,
  ...azureDevOpsLoaders
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
  typeof jiraServerLoaders &
  typeof pollLoaders &
  typeof integrationAuthLoaders &
  typeof primaryKeyLoaderMakers &
  typeof foreignKeyLoaderMakers &
  typeof azureDevOpsLoaders &
  typeof gitlabLoaders
type CustomLoaders = keyof CustomLoaderMakers
type Uncustom<T> = T extends (parent: RootDataLoader) => infer U ? U : never
type TypeFromCustom<T extends CustomLoaders> = Uncustom<CustomLoaderMakers[T]>

export type TypedDataLoader<LoaderName> = LoaderName extends CustomLoaders
  ? TypeFromCustom<LoaderName>
  : UpdatableCacheDataLoader<
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
  // casted to any because access to the loaders will results in a creation if needed
  loaders: LoaderDict = {} as any
  constructor(dataLoaderOptions: DataLoader.Options<any, any> = {}) {
    this.dataLoaderOptions = dataLoaderOptions
  }

  get<LoaderName extends Loaders>(loaderName: LoaderName): TypedDataLoader<LoaderName> {
    let loader = this.loaders[loaderName]
    if (loader) return loader as TypedDataLoader<LoaderName>
    const loaderMaker = loaderMakers[loaderName]
    if (loaderMaker instanceof RethinkPrimaryKeyLoaderMaker) {
      const {table} = loaderMaker
      loader = rethinkPrimaryKeyLoader(this.dataLoaderOptions, table)
    } else if (loaderMaker instanceof RethinkForeignKeyLoaderMaker) {
      const {fetch, field, pk} = loaderMaker
      const basePkLoader = this.get(pk as PrimaryLoaders)
      loader = rethinkForeignKeyLoader(basePkLoader, this.dataLoaderOptions, field, fetch)
    } else {
      loader = (loaderMaker as any)(this)
    }
    this.loaders[loaderName] = loader!
    return loader as TypedDataLoader<LoaderName>
  }
}
