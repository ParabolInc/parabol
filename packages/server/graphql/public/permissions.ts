import {allow, and, not, or} from 'graphql-shield'
import type {ShieldRule} from '../composeResolvers'
import type {Resolvers} from './resolverTypes'
import {hasOrgRole} from './rules/hasOrgRole'
import {hasPageAccess} from './rules/hasPageAccess'
import {hasProviderAccess} from './rules/hasProviderAccess'
import isAuthenticated from './rules/isAuthenticated'
import isEnvVarTrue from './rules/isEnvVarTrue'
import {isMeetingFacilitator} from './rules/isMeetingFacilitator'
import {isMeetingMember} from './rules/isMeetingMember'
import {isNull} from './rules/isNull'
import {isOrgAdminBySAMLDomain} from './rules/isOrgAdminBySAMLDomain'
import {isOrgTier} from './rules/isOrgTier'
import isSuperUser from './rules/isSuperUser'
import {isTeamMember} from './rules/isTeamMember'
import {isTeamMemberOfMeeting} from './rules/isTeamMemberOfMeeting'
import {isUser} from './rules/isUser'
import isUserViewer from './rules/isUserViewer'
import {isViewerBillingLeader} from './rules/isViewerBillingLeader'
import {isViewerOnOrg} from './rules/isViewerOnOrg'
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
    addComment: isMeetingMember<'Mutation.addComment'>('args.comment.discussionId', 'discussions'),
    addGitHubAuth: isTeamMember<'Mutation.addGitHubAuth'>('args.teamId'),
    addOrg: rateLimit({perMinute: 2, perHour: 5}),
    addPokerTemplate: isTeamMember<'Mutation.addPokerTemplate'>('args.teamId'),
    addPokerTemplateDimension: isTeamMember<'Mutation.addPokerTemplateDimension'>(
      'args.templateId',
      'meetingTemplates'
    ),
    addPokerTemplateScale: isTeamMember<'Mutation.addPokerTemplateScale'>('args.teamId'),
    addPokerTemplateScaleValue: isTeamMember<'Mutation.addPokerTemplateScaleValue'>(
      'args.scaleId',
      'templateScales'
    ),
    addReactjiToReactable: isMeetingMember<'Mutation.addReactjiToReactable'>('args.meetingId'),
    addReflectTemplate: isTeamMember<'Mutation.addReflectTemplate'>('args.teamId'),
    addReflectTemplatePrompt: isTeamMember<'Mutation.addReflectTemplatePrompt'>(
      'args.templateId',
      'meetingTemplates'
    ),
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
    archiveTeam: or(
      isSuperUser,
      isViewerTeamLead<'Mutation.archiveTeam'>('args.teamId'),
      isViewerBillingLeader<'Mutation.archiveTeam'>('args.teamId', 'teams')
    ),
    autogroup: isTeamMemberOfMeeting<'Mutation.autogroup'>('args.meetingId'),
    changeTaskTeam: isTeamMember<'Mutation.changeTaskTeam'>('args.teamId'),
    createImposterToken: isSuperUser,
    createOAuth1AuthorizeUrl: isTeamMember<'Mutation.createOAuth1AuthorizeUrl'>('args.teamId'),
    createOAuthAPIProvider: hasOrgRole<'Mutation.createOAuthAPIProvider'>(
      'args.orgId',
      'ORG_ADMIN'
    ),
    createPersonalAccessToken: rateLimit({perMinute: 10, perHour: 50}),
    createPage: or(
      isNull<'Mutation.createPage'>('args.teamId'),
      isTeamMember<'Mutation.createPage'>('args.teamId')
    ),
    createPoll: isTeamMember<'Mutation.createPoll'>('args.newPoll.discussionId', 'discussions'),
    createReflection: isTeamMemberOfMeeting<'Mutation.createReflection'>('args.input.meetingId'),
    createStripeSubscription: isViewerOnOrg<'Mutation.createStripeSubscription'>('args.orgId'),
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
    editCommenting: isMeetingMember<'Mutation.editCommenting'>('args.discussionId', 'discussions'),
    editReflection: isTeamMemberOfMeeting<'Mutation.editReflection'>('args.meetingId'),
    editTask: isTeamMember<'Mutation.editTask'>('args.taskId', 'tasks'),
    emailPasswordReset: rateLimit({perMinute: 5, perHour: 50}),
    endCheckIn: or(isTeamMemberOfMeeting<'Mutation.endCheckIn'>('args.meetingId'), isSuperUser),
    endDraggingReflection: isMeetingMember<'Mutation.endDraggingReflection'>(
      'args.reflectionId',
      'retroReflections'
    ),
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
    joinTeam: isViewerOnOrg<'Mutation.joinTeam'>('args.teamId', 'teams'),
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
    modifyCheckInQuestion: isMeetingFacilitator<'Mutation.modifyCheckInQuestion'>('args.meetingId'),
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
    moveTeamToOrg: isViewerBillingLeader<'Mutation.moveTeamToOrg'>('args.orgId'),
    navigateMeeting: isMeetingFacilitator<'Mutation.navigateMeeting'>('args.meetingId'),
    persistGitHubSearchQuery: isTeamMember<'Mutation.persistGitHubSearchQuery'>('args.teamId'),
    persistIntegrationSearchQuery:
      isTeamMember<'Mutation.persistIntegrationSearchQuery'>('args.teamId'),
    persistJiraSearchQuery: isTeamMember<'Mutation.persistJiraSearchQuery'>('args.teamId'),
    pokerAnnounceDeckHover:
      isTeamMemberOfMeeting<'Mutation.pokerAnnounceDeckHover'>('args.meetingId'),
    pokerResetDimension: isMeetingFacilitator<'Mutation.pokerResetDimension'>('args.meetingId'),
    pokerRevealVotes: isMeetingFacilitator<'Mutation.pokerRevealVotes'>('args.meetingId'),
    pokerTemplateDimensionUpdateDescription:
      isTeamMember<'Mutation.pokerTemplateDimensionUpdateDescription'>(
        'args.dimensionId',
        'templateDimensions'
      ),
    promoteNewMeetingFacilitator:
      isTeamMemberOfMeeting<'Mutation.promoteNewMeetingFacilitator'>('args.meetingId'),
    promoteToTeamLead: or(
      isSuperUser,
      isViewerTeamLead<'Mutation.promoteToTeamLead'>('args.teamId'),
      isViewerBillingLeader<'Mutation.promoteToTeamLead'>('args.teamId', 'teams')
    ),
    pushInvitation: rateLimit({perMinute: 10, perHour: 20}),
    reflectTemplatePromptUpdateDescription:
      isTeamMember<'Mutation.reflectTemplatePromptUpdateDescription'>(
        'args.promptId',
        'reflectPrompts'
      ),
    reflectTemplatePromptUpdateGroupColor:
      isTeamMember<'Mutation.reflectTemplatePromptUpdateGroupColor'>(
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
    removePokerTemplate: or(
      isViewerBillingLeader<'Mutation.removePokerTemplate'>('args.templateId', 'meetingTemplates'),
      isTeamMember<'Mutation.removePokerTemplate'>('args.templateId', 'meetingTemplates')
    ),
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
    removeReflectTemplate: or(
      isViewerBillingLeader<'Mutation.removeReflectTemplate'>(
        'args.templateId',
        'meetingTemplates'
      ),
      isTeamMember<'Mutation.removeReflectTemplate'>('args.templateId', 'meetingTemplates')
    ),
    removeReflectTemplatePrompt: isTeamMember<'Mutation.removeReflectTemplatePrompt'>(
      'args.promptId',
      'reflectPrompts'
    ),
    removeReflection: isUser<'Mutation.removeReflection'>(
      'args.reflectionId',
      'retroReflections',
      'creatorId'
    ),
    removeSlackAuth: isTeamMember<'Mutation.removeSlackAuth'>('args.teamId'),
    removeTeamMember: or(
      isUser<'Mutation.removeTeamMember'>('args.userId'),
      isViewerTeamLead<'Mutation.removeTeamMember'>('args.teamId'),
      isViewerBillingLeader<'Mutation.removeTeamMember'>('args.teamId', 'teams')
    ),
    removeTeamMemberIntegrationAuth:
      isTeamMember<'Mutation.removeTeamMemberIntegrationAuth'>('args.teamId'),
    renameMeeting: isMeetingFacilitator<'Mutation.renameMeeting'>('args.meetingId'),
    renameMeetingTemplate: or(
      isViewerBillingLeader<'Mutation.renameMeetingTemplate'>(
        'args.templateId',
        'meetingTemplates'
      ),
      isTeamMember<'Mutation.renameMeetingTemplate'>('args.templateId', 'meetingTemplates')
    ),
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
    resetRetroMeetingToGroupStage:
      isMeetingFacilitator<'Mutation.resetRetroMeetingToGroupStage'>('args.meetingId'),
    revealTeamHealthVotes: isMeetingFacilitator<'Mutation.revealTeamHealthVotes'>('args.meetingId'),
    selectTemplate: isTeamMember<'Mutation.selectTemplate'>('args.teamId'),
    setDefaultSlackChannel: isTeamMember<'Mutation.setDefaultSlackChannel'>('args.teamId'),
    setJiraDisplayFieldIds: isTeamMember<'Mutation.setJiraDisplayFieldIds'>('args.teamId'),
    setMeetingMusic: isMeetingFacilitator<'Mutation.setMeetingMusic'>('args.meetingId'),
    setMeetingSettings: isTeamMember<'Mutation.setMeetingSettings'>(
      'args.settingsId',
      'meetingSettings'
    ),
    setNotificationStatus: isUser<'Mutation.setNotificationStatus'>(
      'args.notificationId',
      'notifications'
    ),
    setOrgUserRole: or(isSuperUser, isViewerBillingLeader<'Mutation.setOrgUserRole'>('args.orgId')),
    setPhaseFocus: isMeetingFacilitator<'Mutation.setPhaseFocus'>('args.meetingId'),
    setPokerSpectate: isMeetingMember<'Mutation.setPokerSpectate'>('args.meetingId'),
    setSlackNotification: isTeamMember<'Mutation.setSlackNotification'>('args.teamId'),
    setStageTimer: isMeetingFacilitator<'Mutation.setStageTimer'>('args.meetingId'),
    setTaskEstimate: isTeamMember<'Mutation.setTaskEstimate'>('args.taskEstimate.taskId', 'tasks'),
    setTaskHighlight: and(
      isTeamMember<'Mutation.setTaskHighlight'>('args.meetingId', 'newMeetings'),
      isUser<'Mutation.setTaskHighlight'>('args.taskId', 'tasks')
    ),
    setTeamHealthVote: isTeamMember<'Mutation.setTeamHealthVote'>('args.meetingId', 'newMeetings'),
    shareTopic: isTeamMember<'Mutation.shareTopic'>('args.meetingId', 'newMeetings'),
    signOut: allow,
    signUpWithPassword: and(
      not(isEnvVarTrue('AUTH_INTERNAL_DISABLED')),
      rateLimit({perMinute: 50, perHour: 500})
    ),
    startCheckIn: isTeamMember<'Mutation.startCheckIn'>('args.teamId'),
    startDraggingReflection: isMeetingMember<'Mutation.startDraggingReflection'>(
      'args.reflectionId',
      'retroReflections'
    ),
    startRetrospective: isTeamMember<'Mutation.startRetrospective'>('args.teamId'),
    startSprintPoker: isTeamMember<'Mutation.startSprintPoker'>('args.teamId'),
    startTeamPrompt: isTeamMember<'Mutation.startTeamPrompt'>('args.teamId'),
    toggleAIFeatures: or(
      isSuperUser,
      isViewerBillingLeader<'Mutation.toggleAIFeatures'>('args.orgId')
    ),
    toggleTeamDrawer: isTeamMember<'Mutation.toggleTeamDrawer'>('args.teamId'),
    toggleTeamPrivacy: or(
      isViewerBillingLeader<'Mutation.toggleTeamPrivacy'>('args.teamId', 'teams'),
      isViewerTeamLead<'Mutation.toggleTeamPrivacy'>('args.teamId')
    ),
    unlinkMattermostChannel: isTeamMember<'Mutation.unlinkMattermostChannel'>('args.teamId'),
    updateAgendaItem: isTeamMember<'Mutation.updateAgendaItem'>(
      'args.updatedAgendaItem.id',
      'agendaItems'
    ),
    updateAzureDevOpsDimensionField: isTeamMember<'Mutation.updateAzureDevOpsDimensionField'>(
      'args.meetingId',
      'newMeetings'
    ),
    updateCommentContent: isMeetingMember<'Mutation.updateCommentContent'>('args.meetingId'),
    updateCreditCard: isViewerBillingLeader<'Mutation.updateCreditCard'>('args.orgId'),
    updateDragLocation: isTeamMember<'Mutation.updateDragLocation'>('args.input.teamId'),
    updateGitHubDimensionField: isTeamMember<'Mutation.updateGitHubDimensionField'>(
      'args.meetingId',
      'newMeetings'
    ),
    updateGitLabDimensionField: isTeamMember<'Mutation.updateGitLabDimensionField'>(
      'args.meetingId',
      'newMeetings'
    ),
    updateJiraDimensionField: isTeamMember<'Mutation.updateJiraDimensionField'>(
      'args.meetingId',
      'newMeetings'
    ),
    updateJiraServerDimensionField: isTeamMember<'Mutation.updateJiraServerDimensionField'>(
      'args.meetingId',
      'newMeetings'
    ),
    updateLinearDimensionField: isTeamMember<'Mutation.updateLinearDimensionField'>(
      'args.meetingId',
      'newMeetings'
    ),
    updateMeetingPrompt: isMeetingFacilitator<'Mutation.updateMeetingPrompt'>('args.meetingId'),
    updateMeetingTemplate: isTeamMember<'Mutation.updateMeetingTemplate'>(
      'args.meetingId',
      'newMeetings'
    ),
    updateNewCheckInQuestion: isTeamMember<'Mutation.updateNewCheckInQuestion'>(
      'args.meetingId',
      'newMeetings'
    ),
    updateOAuthAPIProvider: hasProviderAccess<'Mutation.updateOAuthAPIProvider'>('args.providerId'),
    updateOrg: isViewerBillingLeader<'Mutation.updateOrg'>('args.updatedOrg.id'),
    updatePage: hasPageAccess<'Mutation.updatePage'>('args.pageId', 'viewer'),
    updatePageAccess: and(
      hasPageAccess<'Mutation.updatePageAccess'>('args.pageId', 'viewer'),
      // limit looking up users by email
      rateLimit({perMinute: 50, perHour: 100})
    ),
    updatePageParentLink: hasPageAccess<'Mutation.updatePageParentLink'>('args.pageId', 'owner'),
    updatePokerScope: isTeamMember<'Mutation.updatePokerScope'>('args.meetingId', 'newMeetings'),
    updatePokerTemplateDimensionScale: isTeamMember<'Mutation.updatePokerTemplateDimensionScale'>(
      'args.dimensionId',
      'templateDimensions'
    ),
    updatePokerTemplateScaleValue: isTeamMember<'Mutation.updatePokerTemplateScaleValue'>(
      'args.scaleId',
      'templateScales'
    ),
    updateRecurrenceSettings: isTeamMember<'Mutation.updateRecurrenceSettings'>(
      'args.meetingId',
      'newMeetings'
    ),
    updateReflectionContent: isMeetingMember<'Mutation.updateReflectionContent'>(
      'args.reflectionId',
      'retroReflections'
    ),
    updateReflectionGroupTitle: isMeetingMember<'Mutation.updateReflectionGroupTitle'>(
      'args.reflectionGroupId',
      'retroReflectionGroups'
    ),
    updateRetroMaxVotes: isMeetingMember<'Mutation.updateRetroMaxVotes'>('args.meetingId'),
    updateSCIM: hasOrgRole<'Mutation.updateSCIM'>('args.orgId', 'ORG_ADMIN'),
    updateTask: isTeamMember<'Mutation.updateTask'>('args.updatedTask.id', 'tasks'),
    updateTaskDueDate: isTeamMember<'Mutation.updateTaskDueDate'>('args.taskId', 'tasks'),
    updateTeamName: isTeamMember<'Mutation.updateTeamName'>('args.updatedTeam.id'),
    updateTeamSortOrder: isTeamMember<'Mutation.updateTeamSortOrder'>('args.teamId'),
    updateTemplateCategory: isTeamMember<'Mutation.updateTemplateCategory'>(
      'args.templateId',
      'meetingTemplates'
    ),
    uploadIdPMetadata: hasOrgRole<'Mutation.uploadIdPMetadata'>('args.orgId', 'ORG_ADMIN'),
    uploadOrgImage: isViewerBillingLeader<'Mutation.uploadOrgImage'>('args.orgId'),
    upsertTeamPromptResponse:
      isMeetingMember<'Mutation.upsertTeamPromptResponse'>('args.meetingId'),
    verifyEmail: rateLimit({perMinute: 50, perHour: 100}),
    voteForPokerStory: isMeetingMember<'Mutation.voteForPokerStory'>('args.meetingId'),
    voteForReflectionGroup: isMeetingMember<'Mutation.voteForReflectionGroup'>(
      'args.reflectionGroupId',
      'retroReflectionGroups'
    )
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
    domains: or(isSuperUser, isUserViewer),
    parseSAMLMetadata: isOrgAdminBySAMLDomain
  },
  Page: {
    parentPage: hasPageAccess<'Page.parentPage'>('source.parentPageId', 'viewer')
  }
}

export default permissionMap
