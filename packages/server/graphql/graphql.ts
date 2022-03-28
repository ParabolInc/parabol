import {GraphQLFieldConfig} from 'graphql'
import AuthToken from '../database/types/AuthToken'
import RootDataLoader from '../dataloader/RootDataLoader'
import {CacheWorker} from './DataLoaderCache'
import {InMemoryRateLimiter} from './InMemoryRateLimiter'

// Avoid needless parsing & validating for the 300 hottest operations
export type DataLoaderWorker = CacheWorker<RootDataLoader>

export interface GQLContext {
  authToken: AuthToken
  rateLimiter: InMemoryRateLimiter
  ip: string
  socketId: string
  dataLoader: DataLoaderWorker
}

export interface InternalContext {
  dataLoader: DataLoaderWorker
  authToken: AuthToken
  // not present if called ad-hoc
  socketId?: string
}

export type GQLMutation = GraphQLFieldConfig<undefined, GQLContext> & {name: string}
