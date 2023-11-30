import {and, not, or} from 'graphql-shield'
import type {ShieldRule} from 'graphql-shield/dist/types'
import {Resolvers} from './resolverTypes'
import getTeamIdFromArgTemplateId from './rules/getTeamIdFromArgTemplateId'
import isAuthenticated from './rules/isAuthenticated'
import isEnvVarTrue from './rules/isEnvVarTrue'
import {isOrgTier, isOrgTierSource} from './rules/isOrgTier'
import isSuperUser from './rules/isSuperUser'
import isUserViewer from './rules/isUserViewer'
import {isViewerBillingLeader, isViewerBillingLeaderSource} from './rules/isViewerBillingLeader'
import isViewerOnTeam from './rules/isViewerOnTeam'
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
    // don't check isAuthenticated for acceptTeamInvitation here because there are special cases handled in the resolver
    acceptTeamInvitation: rateLimit({perMinute: 50, perHour: 100}),
    createImposterToken: isSuperUser,
    loginWithGoogle: and(
      not(isEnvVarTrue('AUTH_GOOGLE_DISABLED')),
      rateLimit({perMinute: 50, perHour: 500})
    ),
    loginWithMicrosoft: and(
      not(isEnvVarTrue('AUTH_MICROSOFT_DISABLED')),
      rateLimit({perMinute: 50, perHour: 500})
    ),
    signUpWithPassword: and(
      not(isEnvVarTrue('AUTH_INTERNAL_DISABLED')),
      rateLimit({perMinute: 50, perHour: 500})
    ),
    loginWithPassword: and(
      not(isEnvVarTrue('AUTH_INTERNAL_DISABLED')),
      rateLimit({perMinute: 50, perHour: 500})
    ),
    verifyEmail: rateLimit({perMinute: 50, perHour: 100}),
    addApprovedOrganizationDomains: or(
      isSuperUser,
      and(isViewerBillingLeader, isOrgTier('enterprise'))
    ),
    removeApprovedOrganizationDomains: or(isSuperUser, isViewerBillingLeader),
    updateTemplateCategory: isViewerOnTeam(getTeamIdFromArgTemplateId)
  },
  Query: {
    '*': isAuthenticated,
    getDemoEntities: rateLimit({perMinute: 5, perHour: 50})
  },
  Organization: {
    saml: and(isViewerBillingLeaderSource, isOrgTierSource('enterprise'))
  },
  User: {
    domains: or(isSuperUser, isUserViewer)
  }
}

export default permissionMap
