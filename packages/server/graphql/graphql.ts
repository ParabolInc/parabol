import type {GraphQLFieldConfig} from 'graphql'
import type AuthToken from '../database/types/AuthToken'
import type {CacheWorker} from '../dataloader/DataLoaderCache'
import type RootDataLoader from '../dataloader/RootDataLoader'
import type {InMemoryRateLimiter} from '../utils/rateLimiters/InMemoryRateLimiter'
import type {ResourceGrants} from './public/ResourceGrants'

// Avoid needless parsing & validating for the 300 hottest operations
export type DataLoaderWorker = CacheWorker<RootDataLoader>

export interface GQLContext {
  authToken: AuthToken
  rateLimiter: InMemoryRateLimiter
  ip: string
  socketId: string
  dataLoader: DataLoaderWorker
  request: Request
  resourceGrants?: ResourceGrants
}

// Rules run before isAuthenticated has passed (and() runs its rules in parallel), so they see a signed-out caller's null token
export type RuleContext = Omit<GQLContext, 'authToken'> & {authToken: AuthToken | null}

export type SubscriptionContext = Omit<GQLContext, 'dataLoader'>
export interface InternalContext {
  dataLoader: DataLoaderWorker
  authToken: AuthToken
  ip: string
  // not present if called ad-hoc
  socketId?: string
}

export type GQLMutation = GraphQLFieldConfig<undefined, GQLContext> & {
  name: string
}
