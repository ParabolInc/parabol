/* This file dynamically requires all queries, mutations, and types.
 * No need to mess with this unless we add subscriptions to the private schema
 */
import {allow} from 'graphql-shield'
import {isSuperUser, PermissionMap} from '../public/permissions'
import {Resolvers} from './resolverTypes'

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
