/* This file dynamically requires all queries, mutations, and types.
 * No need to mess with this unless we add subscriptions to the private schema
 */
import {rule} from 'graphql-shield'
import type {ShieldRule} from 'graphql-shield/dist/types'
import {getUserId} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import {Resolvers} from './resolverTypes'

type Wildcard = {
  '*': ShieldRule
}

type FieldMap<T> =
  | Wildcard
  | {
      [P in keyof T]: ShieldRule
    }

export type PermissionMap<T> = {
  [P in keyof T]?: FieldMap<T[P]>
}

export const isSuperUser = rule({cache: 'contextual'})(
  (_source, _args, {authToken}: GQLContext) => {
    return authToken?.rol === 'su'
  }
)

const isAuthenticated = rule({cache: 'contextual'})((_source, _args, {authToken}: GQLContext) => {
  return typeof authToken?.sub === 'string'
})

interface RateLimitOptions {
  perMinute: number
  perHour: number
}

const rateLimit = ({perMinute, perHour}: RateLimitOptions) =>
  rule({cache: 'contextual'})((_source, _args, context: GQLContext, info) => {
    const {authToken, rateLimiter, ip} = context
    const {fieldName} = info
    const userId = getUserId(authToken) || ip
    const {lastMinute, lastHour} = rateLimiter.log(userId, fieldName, !!perHour)
    if (lastMinute > perMinute || (lastHour && lastHour > perHour)) {
      throw new Error('429 Too Many Requests')
    }
    return true
  })

const permissionMap: PermissionMap<Resolvers> = {
  Mutation: {
    '*': isAuthenticated,
    loginWithGoogle: rateLimit({perMinute: 50, perHour: 500}),
    loginWithPassword: rateLimit({perMinute: 50, perHour: 500})
  },
  Query: {
    '*': isAuthenticated
  }
}

export default permissionMap
