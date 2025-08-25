import {and, not, or} from 'graphql-shield'
import type {ShieldRule} from '../composeResolvers'
import type {Resolvers} from './resolverTypes'
import getTeamIdFromArgTemplateId from './rules/getTeamIdFromArgTemplateId'
import {hasOrgRole} from './rules/hasOrgRole'
import {hasPageAccess} from './rules/hasPageAccess'
import isAuthenticated from './rules/isAuthenticated'
import isEnvVarTrue from './rules/isEnvVarTrue'
import {isOrgTier} from './rules/isOrgTier'
import isSuperUser from './rules/isSuperUser'
import {isTeamMember} from './rules/isTeamMember'
import isUserViewer from './rules/isUserViewer'
import {isViewerBillingLeader} from './rules/isViewerBillingLeader'
import {isViewerOnOrg} from './rules/isViewerOnOrg'
import isViewerOnTeam from './rules/isViewerOnTeam'
import {isViewerTeamLead} from './rules/isViewerTeamLead'
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
      and(
        isViewerBillingLeader<'Mutation.addApprovedOrganizationDomains'>('args.orgId'),
        isOrgTier<'Mutation.addApprovedOrganizationDomains'>('args.orgId', 'enterprise')
      )
    ),
    removeApprovedOrganizationDomains: or(
      isSuperUser,
      isViewerBillingLeader<'Mutation.removeApprovedOrganizationDomains'>('args.orgId')
    ),
    uploadIdPMetadata: isViewerOnOrg<'Mutation.uploadIdPMetadata'>('args.orgId'),
    updatePage: hasPageAccess<'Mutation.updatePage'>('args.pageId', 'viewer'),
    updatePageParentLink: hasPageAccess<'Mutation.updatePageParentLink'>('args.pageId', 'owner'),
    archivePage: hasPageAccess<'Mutation.archivePage'>('args.pageId', 'owner'),
    updatePageAccess: and(
      hasPageAccess<'Mutation.updatePageAccess'>('args.pageId', 'owner'),
      // limit looking up users by email
      rateLimit({perMinute: 50, perHour: 100})
    ),
    updateTemplateCategory: isViewerOnTeam(getTeamIdFromArgTemplateId),
    updateTeamSortOrder: isTeamMember<'Mutation.updateTeamSortOrder'>('args.teamId'),
    generateInsight: or(isSuperUser, isViewerTeamLead('args.teamId'))
  },
  Query: {
    '*': isAuthenticated,
    getDemoGroupTitle: rateLimit({perMinute: 15, perHour: 150}),
    SAMLIdP: rateLimit({perMinute: 120, perHour: 3600}),
    page: and(
      rateLimit({perMinute: 20, perHour: 100}),
      hasPageAccess<'User.page'>('args.pageId', 'viewer')
    )
  },
  Organization: {
    saml: and(
      isViewerBillingLeader<'Organization.saml'>('source.id'),
      isOrgTier<'Organization.saml'>('source.id', 'enterprise')
    )
  },
  RetroReflectionGroup: {
    smartTitle: isSuperUser,
    voterIds: isSuperUser
  },
  Team: {
    massInvitation: or(
      // TODO or rules run in parallel, make it go in serial since org_admin check is rare
      isTeamMember<'Team.massInvitation'>('source.id'),
      hasOrgRole<'Team.massInvitation'>('source.orgId', 'ORG_ADMIN')
    )
  },
  User: {
    domains: or(isSuperUser, isUserViewer)
  },
  Page: {
    parentPage: hasPageAccess<'Page.parentPage'>('source.parentPageId', 'viewer')
  }
}

export default permissionMap
