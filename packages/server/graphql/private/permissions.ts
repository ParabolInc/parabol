import type {PermissionMap} from '../public/permissions'
import isSuperUser from '../public/rules/isSuperUser'
import type {Resolvers} from './resolverTypes'

const permissionMap: PermissionMap<Resolvers> = {
  Mutation: {
    '*': isSuperUser
  },
  Query: {
    '*': isSuperUser
  }
}

export default permissionMap
