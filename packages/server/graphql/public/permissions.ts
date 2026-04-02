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
    addAtlassianAuth: isTeamMember<'Mutation.addAtlassianAuth'>('args.teamId'),
    addApprovedOrganizationDomains: or(
      isSuperUser,
      and(
        isViewerBillingLeader<'Mutation.addApprovedOrganizationDomains'>('args.orgId'),
        isOrgTier<'Mutation.addApprovedOrganizationDomains'>('args.orgId', 'enterprise')
      )
    ),
    addGitHubAuth: isTeamMember<'Mutation.addGitHubAuth'>('args.teamId'),
    addOrg: rateLimit({perMinute: 2, perHour: 5}),
    addPokerTemplate: isTeamMember<'Mutation.addPokerTemplate'>('args.teamId'),
    addPokerTemplateDimension: isViewerOnTeam(getTeamIdFromArgTemplateId),
    addPokerTemplateScale: isTeamMember<'Mutation.addPokerTemplateScale'>('args.teamId'),
    addPokerTemplateScaleValue: isTeamMember<'Mutation.addPokerTemplateScaleValue'>(
      'args.scaleId',
      'templateScales'
    ),
    addReactjiToReactable: isMeetingMember<'Mutation.addReactjiToReactable'>('args.meetingId'),
    addReflectTemplate: isTeamMember<'Mutation.addReflectTemplate'>('args.teamId'),
    addReflectTemplatePrompt: isViewerOnTeam(getTeamIdFromArgTemplateId),
    addSlackAuth: isTeamMember<'Mutation.addSlackAuth'>('args.teamId'),
    addTeam: rateLimit({perMinute: 15, perHour: 50}),
    addTeamMemberIntegrationAuth:
      isTeamMember<'Mutation.addTeamMemberIntegrationAuth'>('args.teamId'),
    addTranscriptionBot: isTeamMemberOfMeeting<'Mutation.addTranscriptionBot'>('args.meetingId'),
    archiveOrganization: or(
      isSuperUser,
      isViewerBillingLeader<'Mutation.archiveOrganization'>('args.orgId')
    ),
    archivePage: hasPageAccess<'Mutation.archivePage'>('args.pageId', 'owner'),
    autogroup: isTeamMemberOfMeeting<'Mutation.autogroup'>('args.meetingId'),
    changeTaskTeam: isTeamMember<'Mutation.changeTaskTeam'>('args.teamId'),
    createImposterToken: isSuperUser,
    createOAuth1AuthorizeUrl: isTeamMember<'Mutation.createOAuth1AuthorizeUrl'>('args.teamId'),
    createOAuthAPIProvider: hasOrgRole<'Mutation.createOAuthAPIProvider'>(
      'args.orgId',
      'ORG_ADMIN'
    ),
    createPage: or(
      isNull<'Mutation.createPage'>('args.teamId'),
      isTeamMember<'Mutation.createPage'>('args.teamId')
    ),
    createPoll: isTeamMember<'Mutation.createPoll'>('args.newPoll.discussionId', 'discussions'),
    createReflection: isTeamMemberOfMeeting<'Mutation.createReflection'>('args.input.meetingId'),
    createTask: isTeamMember<'Mutation.createTask'>('args.newTask.teamId'),
    createTaskIntegration: isTeamMember<'Mutation.createTaskIntegration'>('args.taskId', 'tasks'),
    deleteComment: isMeetingMember<'Mutation.deleteComment'>('args.meetingId'),
    deleteOAuthAPIProvider: hasProviderAccess<'Mutation.deleteOAuthAPIProvider'>('args.providerId'),
    deleteTask: isTeamMember<'Mutation.deleteTask'>('args.taskId', 'tasks'),
    denyPushInvitation: rateLimit({perMinute: 10, perHour: 20}),
    downgradeToStarter: or(
      isSuperUser,
      isViewerBillingLeader<'Mutation.downgradeToStarter'>('args.orgId')
    ),
    dragDiscussionTopic: isTeamMemberOfMeeting<'Mutation.dragDiscussionTopic'>('args.meetingId'),
    dragEstimatingTask: isTeamMemberOfMeeting<'Mutation.dragEstimatingTask'>('args.meetingId'),
    editReflection: isTeamMemberOfMeeting<'Mutation.editReflection'>('args.meetingId'),
    editTask: isTeamMember<'Mutation.editTask'>('args.taskId', 'tasks'),
    emailPasswordReset: rateLimit({perMinute: 5, perHour: 50}),
    endCheckIn: or(isTeamMemberOfMeeting<'Mutation.endCheckIn'>('args.meetingId'), isSuperUser),
    endRetrospective: or(
      isTeamMemberOfMeeting<'Mutation.endRetrospective'>('args.meetingId'),
      isSuperUser
    ),
    endSprintPoker: or(
      isTeamMemberOfMeeting<'Mutation.endSprintPoker'>('args.meetingId'),
      isSuperUser
    ),
    endTeamPrompt: or(
      isTeamMemberOfMeeting<'Mutation.endTeamPrompt'>('args.meetingId'),
      isSuperUser
    ),
    flagReadyToAdvance: isMeetingMember<'Mutation.flagReadyToAdvance'>('args.meetingId'),
    generateInsight: or(isSuperUser, isViewerTeamLead('args.teamId')),
    inviteToTeam: rateLimit({perMinute: 10, perHour: 100}),
    joinMeeting: isTeamMemberOfMeeting<'Mutation.joinMeeting'>('args.meetingId'),
    linkMattermostChannel: isTeamMember<'Mutation.linkMattermostChannel'>('args.teamId'),
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
    modifyCheckInQuestion:
      isTeamMemberOfMeeting<'Mutation.modifyCheckInQuestion'>('args.meetingId'),
    movePokerTemplateDimension: isTeamMember<'Mutation.movePokerTemplateDimension'>(
      'args.dimensionId',
      'templateDimensions'
    ),
    movePokerTemplateScaleValue: isTeamMember<'Mutation.movePokerTemplateScaleValue'>(
      'args.scaleId',
      'templateScales'
    ),
    moveReflectTemplatePrompt: isTeamMember<'Mutation.moveReflectTemplatePrompt'>(
      'args.promptId',
      'reflectPrompts'
    ),
    persistGitHubSearchQuery: isTeamMember<'Mutation.persistGitHubSearchQuery'>('args.teamId'),
    persistIntegrationSearchQuery:
      isTeamMember<'Mutation.persistIntegrationSearchQuery'>('args.teamId'),
    persistJiraSearchQuery: isTeamMember<'Mutation.persistJiraSearchQuery'>('args.teamId'),
    pokerAnnounceDeckHover:
      isTeamMemberOfMeeting<'Mutation.pokerAnnounceDeckHover'>('args.meetingId'),
    pokerResetDimension: isTeamMemberOfMeeting<'Mutation.pokerResetDimension'>('args.meetingId'),
    pokerRevealVotes: isTeamMemberOfMeeting<'Mutation.pokerRevealVotes'>('args.meetingId'),
    pokerTemplateDimensionUpdateDescription: isTeamMember<'Mutation.pokerTemplateDimensionUpdateDescription'>(
      'args.dimensionId',
      'templateDimensions'
    ),
    promoteNewMeetingFacilitator:
      isTeamMemberOfMeeting<'Mutation.promoteNewMeetingFacilitator'>('args.meetingId'),
    pushInvitation: rateLimit({perMinute: 10, perHour: 20}),
    reflectTemplatePromptUpdateDescription: isTeamMember<'Mutation.reflectTemplatePromptUpdateDescription'>(
      'args.promptId',
      'reflectPrompts'
    ),
    reflectTemplatePromptUpdateGroupColor: isTeamMember<'Mutation.reflectTemplatePromptUpdateGroupColor'>(
      'args.promptId',
      'reflectPrompts'
    ),
    regenerateOAuthAPIProviderSecret:
      hasProviderAccess<'Mutation.regenerateOAuthAPIProviderSecret'>('args.providerId'),
    removeAgendaItem: isTeamMember<'Mutation.removeAgendaItem'>('args.agendaItemId', 'agendaItems'),
    removeApprovedOrganizationDomains: or(
      isSuperUser,
      isViewerBillingLeader<'Mutation.removeApprovedOrganizationDomains'>('args.orgId')
    ),
    removeAtlassianAuth: isTeamMember<'Mutation.removeAtlassianAuth'>('args.teamId'),
    removeGitHubAuth: isTeamMember<'Mutation.removeGitHubAuth'>('args.teamId'),
    removePokerTemplateDimension: isTeamMember<'Mutation.removePokerTemplateDimension'>(
      'args.dimensionId',
      'templateDimensions'
    ),
    removePokerTemplateScale: isTeamMember<'Mutation.removePokerTemplateScale'>(
      'args.scaleId',
      'templateScales'
    ),
    removePokerTemplateScaleValue: isTeamMember<'Mutation.removePokerTemplateScaleValue'>(
      'args.scaleId',
      'templateScales'
    ),
    removeReflectTemplatePrompt: isTeamMember<'Mutation.removeReflectTemplatePrompt'>(
      'args.promptId',
      'reflectPrompts'
    ),
    removeSlackAuth: isTeamMember<'Mutation.removeSlackAuth'>('args.teamId'),
    removeTeamMemberIntegrationAuth:
      isTeamMember<'Mutation.removeTeamMemberIntegrationAuth'>('args.teamId'),
    renamePokerTemplateDimension: isTeamMember<'Mutation.renamePokerTemplateDimension'>(
      'args.dimensionId',
      'templateDimensions'
    ),
    renamePokerTemplateScale: isTeamMember<'Mutation.renamePokerTemplateScale'>(
      'args.scaleId',
      'templateScales'
    ),
    renameReflectTemplatePrompt: isTeamMember<'Mutation.renameReflectTemplatePrompt'>(
      'args.promptId',
      'reflectPrompts'
    ),
    resetPassword: rateLimit({perMinute: 10, perHour: 100}),
    resetReflectionGroups:
      isTeamMemberOfMeeting<'Mutation.resetReflectionGroups'>('args.meetingId'),
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
    uploadIdPMetadata: hasOrgRole<'Mutation.uploadIdPMetadata'>('args.orgId', 'ORG_ADMIN'),
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
      isViewerOnOrg<'Organization.saml'>('source.id'),
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
