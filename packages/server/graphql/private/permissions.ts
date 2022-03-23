/* This file dynamically requires all queries, mutations, and types.
 * No need to mess with this unless we add subscriptions to the private schema
 */
import {allow, rule} from 'graphql-shield'
import type {ShieldRule} from 'graphql-shield/dist/types'
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

type PermissionMap<T> = {
  [P in keyof T]?: FieldMap<T[P]>
}

const isSuperUser = rule({cache: 'contextual'})((_source, _args, {authToken}: GQLContext) => {
  return authToken?.rol === 'su'
})

const permissionMap: PermissionMap<Resolvers> = {
  Mutation: {
    '*': isSuperUser,
    connectSocket: allow,
    disconnectSocket: allow
  },
  Query: {
    '*': isSuperUser
  }
}

export default permissionMap
