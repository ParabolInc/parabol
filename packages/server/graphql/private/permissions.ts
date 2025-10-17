/* This file dynamically requires all queries, mutations, and types.
 * No need to mess with this unless we add subscriptions to the private schema
 */
import {allow} from 'graphql-shield'
import type {PermissionMap} from '../public/permissions'
import isSuperUser from '../public/rules/isSuperUser'
import type {Resolvers} from './resolverTypes'

const permissionMap: PermissionMap<Resolvers> = {
  Mutation: {
    '*': isSuperUser,
    connectSocket: allow
  },
  Query: {
    '*': isSuperUser
  }
}

export default permissionMap
