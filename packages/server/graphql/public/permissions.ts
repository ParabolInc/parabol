import {and, not} from 'graphql-shield'
import type {ShieldRule} from 'graphql-shield/dist/types'
import {Resolvers} from './resolverTypes'
import isAuthenticated from './rules/isAuthenticated'
import isEnvVarTrue from './rules/isEnvVarTrue'
import isSuperUser from './rules/isSuperUser'
import rateLimit from './rules/rateLimit'

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

const permissionMap: PermissionMap<Resolvers> = {
  Mutation: {
    '*': isAuthenticated,
    createImposterToken: isSuperUser,
    loginWithGoogle: and(
      not(isEnvVarTrue('AUTH_GOOGLE_DISABLED')),
      rateLimit({perMinute: 50, perHour: 500})
    )
  },
  Query: {
    '*': isAuthenticated,
    getDemoEntities: rateLimit({perMinute: 5, perHour: 50})
  }
}

export default permissionMap
