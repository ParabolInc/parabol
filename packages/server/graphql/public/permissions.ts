import {allow, and, not, or} from 'graphql-shield'
import type {ShieldRule} from '../composeResolvers'
import type {Resolvers} from './resolverTypes'
import getTeamIdFromArgSettingsId from './rules/getTeamIdFromArgSettingsId'
import getTeamIdFromArgTemplateId from './rules/getTeamIdFromArgTemplateId'
import {hasOrgRole} from './rules/hasOrgRole'
import {hasPageAccess} from './rules/hasPageAccess'
import {hasProviderAccess} from './rules/hasProviderAccess'
import isAuthenticated from './rules/isAuthenticated'
import isEnvVarTrue from './rules/isEnvVarTrue'
import {isMeetingMember} from './rules/isMeetingMember'
import {isNull} from './rules/isNull'
import {isOrgTier} from './rules/isOrgTier'
import isSuperUser from './rules/isSuperUser'
import {isTeamMember} from './rules/isTeamMember'
import {isTeamMemberOfMeeting} from './rules/isTeamMemberOfMeeting'
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
    addAgendaItem: isTeamMember<'Mutation.addAgendaItem'>('args.newAgendaItem.teamId'),
    addApprovedOrganizationDomains: or(
      isSuperUser,
      and(
        isViewerBillingLeader<'Mutation.addApprovedOrganizationDomains'>('args.orgId'),
        isOrgTier<'Mutation.addApprovedOrganizationDomains'>('args.orgId', 'enterprise')
      )
    ),
    addOrg: rateLimit({perMinute: 2, perHour: 5}),
    addReactjiToReactable: isMeetingMember<'Mutation.addReactjiToReactable'>('args.meetingId'),
    addTeam: rateLimit({perMinute: 15, perHour: 50}),
    archivePage: hasPageAccess<'Mutation.archivePage'>('args.pageId', 'owner'),
    createImposterToken: isSuperUser,
    createOAuthAPIProvider: hasOrgRole<'Mutation.createOAuthAPIProvider'>(
      'args.orgId',
      'ORG_ADMIN'
    ),
    createPage: or(
      isNull<'Mutation.createPage'>('args.teamId'),
      isTeamMember<'Mutation.createPage'>('args.teamId')
    ),
    createReflection: isTeamMemberOfMeeting<'Mutation.createReflection'>('args.input.meetingId'),
    deleteOAuthAPIProvider: hasProviderAccess<'Mutation.deleteOAuthAPIProvider'>('args.providerId'),
    denyPushInvitation: rateLimit({perMinute: 10, perHour: 20}),
    emailPasswordReset: rateLimit({perMinute: 5, perHour: 50}),
    generateInsight: or(isSuperUser, isViewerTeamLead('args.teamId')),
    inviteToTeam: rateLimit({perMinute: 10, perHour: 100}),
    loginWithGoogle: and(
      not(isEnvVarTrue('AUTH_GOOGLE_DISABLED')),
      rateLimit({perMinute: 50, perHour: 500})
    ),
    loginWithMicrosoft: and(
      not(isEnvVarTrue('AUTH_MICROSOFT_DISABLED')),
      rateLimit({perMinute: 50, perHour: 500})
    ),
    loginWithPassword: and(
      not(isEnvVarTrue('AUTH_INTERNAL_DISABLED')),
      rateLimit({perMinute: 50, perHour: 500})
    ),
    pushInvitation: rateLimit({perMinute: 10, perHour: 20}),
    removeApprovedOrganizationDomains: or(
      isSuperUser,
      isViewerBillingLeader<'Mutation.removeApprovedOrganizationDomains'>('args.orgId')
    ),
    resetPassword: rateLimit({perMinute: 10, perHour: 100}),
    selectTemplate: isTeamMember<'Mutation.selectTemplate'>('args.teamId'),
    setMeetingSettings: isViewerOnTeam(getTeamIdFromArgSettingsId),
    signOut: allow,
    signUpWithPassword: and(
      not(isEnvVarTrue('AUTH_INTERNAL_DISABLED')),
      rateLimit({perMinute: 50, perHour: 500})
    ),
    updateOAuthAPIProvider: hasProviderAccess<'Mutation.updateOAuthAPIProvider'>('args.providerId'),
    updatePage: hasPageAccess<'Mutation.updatePage'>('args.pageId', 'viewer'),
    updatePageAccess: and(
      hasPageAccess<'Mutation.updatePageAccess'>('args.pageId', 'viewer'),
      // limit looking up users by email
      rateLimit({perMinute: 50, perHour: 100})
    ),
    updatePageParentLink: hasPageAccess<'Mutation.updatePageParentLink'>('args.pageId', 'owner'),
    updateSCIM: hasOrgRole<'Mutation.updateSCIM'>('args.orgId', 'ORG_ADMIN'),
    updateTeamSortOrder: isTeamMember<'Mutation.updateTeamSortOrder'>('args.teamId'),
    updateTemplateCategory: isViewerOnTeam(getTeamIdFromArgTemplateId),
    uploadIdPMetadata: isViewerOnOrg<'Mutation.uploadIdPMetadata'>('args.orgId'),
    verifyEmail: rateLimit({perMinute: 50, perHour: 100})
  },
  Query: {
    '*': isAuthenticated,
    getDemoGroupTitle: rateLimit({perMinute: 15, perHour: 150}),
    massInvitation: rateLimit({perMinute: 60, perHour: 1800}),
    public: rateLimit({perMinute: 20, perHour: 100}),
    SAMLIdP: rateLimit({perMinute: 120, perHour: 3600}),
    verifiedInvitation: rateLimit({perMinute: 60, perHour: 1800})
  },
  PublicRoot: {
    page: and(
      rateLimit({perMinute: 20, perHour: 100}),
      hasPageAccess<'User.page'>('args.pageId', 'viewer')
    )
  },
  Organization: {
    oauthAPIProvider: hasProviderAccess<'Organization.oauthAPIProvider'>('args.providerId'),
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
