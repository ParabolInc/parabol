/* This file dynamically requires all queries, mutations, and types.
 * No need to mess with this unless we add subscriptions to the private schema
 */
import {allow} from 'graphql-shield'
import {PermissionMap} from '../public/permissions'
import isSuperUser from '../public/rules/isSuperUser'
import {Resolvers} from './resolverTypes'

const permissionMap: PermissionMap<Resolvers> = {
  Mutation: {
    '*': isSuperUser,
    connectSocket: allow,
    disconnectSocket: allow,
    changeEmailDomain: allow
  },
  Query: {
    '*': isSuperUser
  }
}

export default permissionMap
