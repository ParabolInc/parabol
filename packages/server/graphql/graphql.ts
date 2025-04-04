import {GraphQLFieldConfig} from 'graphql'
import AuthToken from '../database/types/AuthToken'
import type {CacheWorker} from '../dataloader/DataLoaderCache'
import RootDataLoader from '../dataloader/RootDataLoader'
import {InMemoryRateLimiter} from '../utils/rateLimiters/InMemoryRateLimiter'

// Avoid needless parsing & validating for the 300 hottest operations
export type DataLoaderWorker = CacheWorker<RootDataLoader>

export interface GQLContext {
  authToken: AuthToken
  rateLimiter: InMemoryRateLimiter
  ip: string
  socketId: string
  dataLoader: DataLoaderWorker
}

export type SubscriptionContext = Omit<GQLContext, 'dataLoader'>
export interface InternalContext {
  dataLoader: DataLoaderWorker
  authToken: AuthToken
  ip: string
  // not present if called ad-hoc
  socketId?: string
}

export type GQLMutation = GraphQLFieldConfig<undefined, GQLContext> & {name: string}
