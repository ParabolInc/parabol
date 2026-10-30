import {allow, and, not, or} from 'graphql-shield'
import {redactUnless, type ShieldRule} from '../composeResolvers'
import type {Resolvers} from './resolverTypes'
import {hasOrgFeatureFlag} from './rules/hasOrgFeatureFlag'
import {hasOrgRole} from './rules/hasOrgRole'
import {hasPageAccess} from './rules/hasPageAccess'
import {hasProviderAccess} from './rules/hasProviderAccess'
import {hasTokenAudience} from './rules/hasTokenAudience'
import isAuthenticated from './rules/isAuthenticated'
import isEnvVarTrue from './rules/isEnvVarTrue'
import {isMeetingFacilitator} from './rules/isMeetingFacilitator'
import {isMeetingMember} from './rules/isMeetingMember'
import {isNull} from './rules/isNull'
import {isOrgTier} from './rules/isOrgTier'
import {isReportTeamHealthCheck} from './rules/isReportTeamHealthCheck'
import {isRestoringOwnTrashedPage} from './rules/isRestoringOwnTrashedPage'
import isSuperUser from './rules/isSuperUser'
import {isTeamMember} from './rules/isTeamMember'
import {isTeamMemberOfMeeting} from './rules/isTeamMemberOfMeeting'
import {isTeamMemberOrOrgLeader} from './rules/isTeamMemberOrOrgLeader'
import {isTrue} from './rules/isTrue'
import {isUser} from './rules/isUser'
import {isUserViewer} from './rules/isUserViewer'
import {isViewerBillingLeader} from './rules/isViewerBillingLeader'
import {isViewerOnOrg} from './rules/isViewerOnOrg'
import {isViewerTeamLead} from './rules/isViewerTeamLead'
import rateLimit from './rules/rateLimit'
import {sharesOrgWithViewer} from './rules/sharesOrgWithViewer'

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

const isUserSelf = isUserViewer<'User.id'>('source.id')
const isOnUserOrg = redactUnless(
  or(isSuperUser, isUserSelf, sharesOrgWithViewer<'User.id'>('source.id'))
)
const isOnTeamOrg = redactUnless(
  or(isSuperUser, isTeamMember<'Team.id'>('source.id'), isViewerOnOrg<'Team.orgId'>('source.orgId'))
)
const canAdministerTeam = or(
  isSuperUser,
  isTeamMember<'Team.id'>('source.id'),
  isViewerBillingLeader<'Team.orgId'>('source.orgId')
)

const permissionMap: PermissionMap<Resolvers> = {
  Mutation: {
    '*': isAuthenticated,
    // don't check isAuthenticated for acceptTeamInvitation here because there are special cases handled in the resolver
    acceptTeamInvitation: rateLimit({perMinute: 50, perHour: 100}),
    askReportQuestion: and(
      or(isSuperUser, isViewerOnOrg<'Mutation.askReportQuestion'>('args.orgId')),
      hasOrgFeatureFlag<'Mutation.askReportQuestion'>('args.orgId', 'Reports'),
      rateLimit({perMinute: 10, perHour: 100})
    ),
    pinReport: and(
      or(isSuperUser, isViewerBillingLeader<'Mutation.pinReport'>('args.orgId')),
      hasOrgFeatureFlag<'Mutation.pinReport'>('args.orgId', 'Reports'),
      rateLimit({perMinute: 30, perHour: 300})
    ),
    unpinReport: and(
      or(isSuperUser, isViewerBillingLeader<'Mutation.unpinReport'>('args.orgId')),
      hasOrgFeatureFlag<'Mutation.unpinReport'>('args.orgId', 'Reports')
    ),
    setOrgStructure: and(
      or(isSuperUser, isViewerBillingLeader<'Mutation.setOrgStructure'>('args.orgId')),
      hasOrgFeatureFlag<'Mutation.setOrgStructure'>('args.orgId', 'Reports')
    ),
    placeTeam: or(isSuperUser, isViewerBillingLeader<'Mutation.placeTeam'>('args.teamId', 'teams')),
    movePinnedReport: and(
      or(isSuperUser, isViewerBillingLeader<'Mutation.movePinnedReport'>('args.orgId')),
      hasOrgFeatureFlag<'Mutation.movePinnedReport'>('args.orgId', 'Reports')
    ),
    logReportQuestionUse: and(
      or(isSuperUser, isViewerOnOrg<'Mutation.logReportQuestionUse'>('args.orgId')),
      hasOrgFeatureFlag<'Mutation.logReportQuestionUse'>('args.orgId', 'Reports'),
      rateLimit({perMinute: 60, perHour: 600})
    ),
    addAgendaItem: isTeamMember<'Mutation.addAgendaItem'>('args.newAgendaItem.teamId'),
    addApprovedOrganizationDomains: or(
      isSuperUser,
      and(
        isViewerBillingLeader<'Mutation.addApprovedOrganizationDomains'>('args.orgId'),
        isOrgTier<'Mutation.addApprovedOrganizationDomains'>('args.orgId', 'enterprise')
      )
    ),
    addComment: isMeetingMember<'Mutation.addComment'>('args.comment.discussionId', 'discussions'),
    addOrg: and(
      not(and(isEnvVarTrue('IS_SINGLE_ORG'), isEnvVarTrue('IS_ENTERPRISE'))),
      rateLimit({perMinute: 2, perHour: 5})
    ),
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
    addPromptTemplate: isTeamMember<'Mutation.addPromptTemplate'>('args.teamId'),
    addTemplatePrompt: isTeamMember<'Mutation.addTemplatePrompt'>(
      'args.templateId',
      'meetingTemplates'
    ),
    addSlackAuth: isTeamMember<'Mutation.addSlackAuth'>('args.teamId'),
    addTeam: rateLimit({perMinute: 15, perHour: 50}),
    addTeamHealthTemplateQuestion: isTeamMember<'Mutation.addTeamHealthTemplateQuestion'>(
      'args.templateId',
      'meetingTemplates'
    ),
    addTeamMemberIntegrationAuth:
      isTeamMember<'Mutation.addTeamMemberIntegrationAuth'>('args.teamId'),
    addTranscriptionBot: isTeamMemberOfMeeting<'Mutation.addTranscriptionBot'>('args.meetingId'),
    archiveOrganization: or(
      isSuperUser,
      isViewerBillingLeader<'Mutation.archiveOrganization'>('args.orgId')
    ),
    archivePage: and(
      isAuthenticated,
      or(hasPageAccess<'Mutation.archivePage'>('args.pageId', 'owner'), isRestoringOwnTrashedPage)
    ),
    archiveTeam: or(
      isSuperUser,
      isViewerTeamLead<'Mutation.archiveTeam'>('args.teamId'),
      isViewerBillingLeader<'Mutation.archiveTeam'>('args.teamId', 'teams')
    ),
    autogroup: isTeamMemberOfMeeting<'Mutation.autogroup'>('args.meetingId'),
    changeTaskTeam: isTeamMember<'Mutation.changeTaskTeam'>('args.teamId'),
    createImposterToken: isSuperUser,
    createOAuth1AuthorizeUrl: isTeamMember<'Mutation.createOAuth1AuthorizeUrl'>('args.teamId'),
    createOAuthAPICode: and(isAuthenticated, hasTokenAudience(['action'])),
    createOAuthAPIProvider: hasOrgRole<'Mutation.createOAuthAPIProvider'>(
      'args.orgId',
      'ORG_ADMIN'
    ),
    createPersonalAccessToken: and(
      hasTokenAudience(['action', 'action-pat']),
      rateLimit({perMinute: 10, perHour: 50})
    ),
    updatePersonalAccessToken: and(
      hasTokenAudience(['action', 'action-pat']),
      rateLimit({perMinute: 10, perHour: 50})
    ),
    createPage: and(
      isAuthenticated,
      or(
        isNull<'Mutation.createPage'>('args.teamId'),
        isTeamMember<'Mutation.createPage'>('args.teamId')
      )
    ),
    createPoll: isTeamMember<'Mutation.createPoll'>('args.newPoll.discussionId', 'discussions'),
    createReflection: isTeamMemberOfMeeting<'Mutation.createReflection'>('args.input.meetingId'),
    createStripeSubscription: isViewerOnOrg<'Mutation.createStripeSubscription'>('args.orgId'),
    createTask: isTeamMember<'Mutation.createTask'>('args.newTask.teamId'),
    createTaskIntegration: isTeamMember<'Mutation.createTaskIntegration'>('args.taskId', 'tasks'),
    deleteComment: isMeetingMember<'Mutation.deleteComment'>('args.meetingId'),
    deleteOAuthAPIProvider: hasProviderAccess<'Mutation.deleteOAuthAPIProvider'>('args.providerId'),
    deleteTask: isTeamMember<'Mutation.deleteTask'>('args.taskId', 'tasks'),
    deleteTeamHealthQuestion: isUserViewer<'Mutation.deleteTeamHealthQuestion'>(
      'args.questionId',
      'teamHealthQuestions',
      'createdBy'
    ),
    denyPushInvitation: rateLimit({perMinute: 10, perHour: 20}),
    disconnectSAML: hasOrgRole<'Mutation.disconnectSAML'>('args.samlId', 'ORG_ADMIN', 'saml'),
    downgradeToStarter: or(
      isSuperUser,
      isViewerBillingLeader<'Mutation.downgradeToStarter'>('args.orgId')
    ),
    dragDiscussionTopic: isTeamMemberOfMeeting<'Mutation.dragDiscussionTopic'>('args.meetingId'),
    dragTeamHealthResultStage:
      isTeamMemberOfMeeting<'Mutation.dragTeamHealthResultStage'>('args.meetingId'),
    dragEstimatingTask: isTeamMemberOfMeeting<'Mutation.dragEstimatingTask'>('args.meetingId'),
    editCommenting: isMeetingMember<'Mutation.editCommenting'>('args.discussionId', 'discussions'),
    editPageContent: and(
      isAuthenticated,
      hasPageAccess<'Mutation.editPageContent'>('args.pageId', 'editor')
    ),
    editReflection: isTeamMemberOfMeeting<'Mutation.editReflection'>('args.meetingId'),
    editTask: isTeamMember<'Mutation.editTask'>('args.taskId', 'tasks'),
    editTeamHealthQuestion: isUserViewer<'Mutation.editTeamHealthQuestion'>(
      'args.questionId',
      'teamHealthQuestions',
      'createdBy'
    ),
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
    endTeamHealth: or(
      isTeamMemberOfMeeting<'Mutation.endTeamHealth'>('args.meetingId'),
      isSuperUser
    ),
    flagReadyToAdvance: isMeetingMember<'Mutation.flagReadyToAdvance'>('args.meetingId'),
    generateInspirationItems:
      isMeetingMember<'Mutation.generateInspirationItems'>('args.input.meetingId'),
    // Not facilitator-only: any team member can already dragReflection, ungroupReflection, and
    // resetReflectionGroups, so restricting this while leaving drag open would protect nothing.
    // The rate limit is what guards the LLM cost of regenerating with a custom instruction.
    generateSuggestedGroups: and(
      isTeamMemberOfMeeting<'Mutation.generateSuggestedGroups'>('args.meetingId'),
      rateLimit({perMinute: 10, perHour: 60})
    ),
    inviteToTeam: and(
      or(isTeamMember<'Mutation.inviteToTeam'>('args.teamId'), isSuperUser),
      rateLimit({perMinute: 10, perHour: 100})
    ),
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
    moveTemplatePrompt: isTeamMember<'Mutation.moveTemplatePrompt'>(
      'args.promptId',
      'templatePrompts'
    ),
    moveTeamToOrg: or(isSuperUser, isViewerBillingLeader<'Mutation.moveTeamToOrg'>('args.orgId')),
    navigateMeeting: isMeetingFacilitator<'Mutation.navigateMeeting'>('args.meetingId'),
    persistIntegrationSearchQuery:
      isTeamMember<'Mutation.persistIntegrationSearchQuery'>('args.teamId'),
    pokerAnnounceDeckHover:
      isTeamMemberOfMeeting<'Mutation.pokerAnnounceDeckHover'>('args.meetingId'),
    pokerResetDimension: isMeetingFacilitator<'Mutation.pokerResetDimension'>('args.meetingId'),
    pokerRevealVotes: isMeetingFacilitator<'Mutation.pokerRevealVotes'>('args.meetingId'),
    pokerTemplateDimensionUpdateDescription:
      isTeamMember<'Mutation.pokerTemplateDimensionUpdateDescription'>(
        'args.dimensionId',
        'templateDimensions'
      ),
    promoteToTeamLead: or(
      isSuperUser,
      isViewerTeamLead<'Mutation.promoteToTeamLead'>('args.teamId'),
      isViewerBillingLeader<'Mutation.promoteToTeamLead'>('args.teamId', 'teams')
    ),
    pushInvitation: rateLimit({perMinute: 10, perHour: 20}),
    regenerateOAuthAPIProviderSecret:
      hasProviderAccess<'Mutation.regenerateOAuthAPIProviderSecret'>('args.providerId'),
    removeAgendaItem: isTeamMember<'Mutation.removeAgendaItem'>('args.agendaItemId', 'agendaItems'),
    removeApprovedOrganizationDomains: or(
      isSuperUser,
      isViewerBillingLeader<'Mutation.removeApprovedOrganizationDomains'>('args.orgId')
    ),
    removeIntegrationSearchQuery: isUserViewer<'Mutation.removeIntegrationSearchQuery'>(
      'args.id',
      'integrationSearchQueries'
    ),
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
    removePromptTemplate: or(
      isViewerBillingLeader<'Mutation.removePromptTemplate'>('args.templateId', 'meetingTemplates'),
      isTeamMember<'Mutation.removePromptTemplate'>('args.templateId', 'meetingTemplates')
    ),
    removeTemplatePrompt: isTeamMember<'Mutation.removeTemplatePrompt'>(
      'args.promptId',
      'templatePrompts'
    ),
    removeReflection: isUser<'Mutation.removeReflection'>(
      'args.reflectionId',
      'retroReflections',
      'creatorId'
    ),
    removeSlackAuth: isTeamMember<'Mutation.removeSlackAuth'>('args.teamId'),
    removeTeamHealthTemplateQuestion: isTeamMember<'Mutation.removeTeamHealthTemplateQuestion'>(
      'args.templateId',
      'meetingTemplates'
    ),
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
    renameTemplatePrompt: isTeamMember<'Mutation.renameTemplatePrompt'>(
      'args.promptId',
      'templatePrompts'
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
    setTeamHealthResponse: isTeamMember<'Mutation.setTeamHealthResponse'>(
      'args.meetingId',
      'newMeetings'
    ),
    // not facilitator-only: spectating is a choice each member makes for themselves
    setTeamHealthSpectate: isMeetingMember<'Mutation.setTeamHealthSpectate'>('args.meetingId'),
    shareTeamPromptResponses:
      isMeetingMember<'Mutation.shareTeamPromptResponses'>('args.meetingId'),
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
    // startMeetingSeriesNow: auth lives in the resolver (args.meetingSeriesId is a global ID
    // that the resolver unwraps via MeetingSeriesId.split before any dataloader lookup).
    startRetrospective: isTeamMember<'Mutation.startRetrospective'>('args.teamId'),
    startSprintPoker: isTeamMember<'Mutation.startSprintPoker'>('args.teamId'),
    startTeamHealth: isTeamMemberOrOrgLeader<'Mutation.startTeamHealth'>('args.teamIds'),
    startTeamPrompt: isTeamMember<'Mutation.startTeamPrompt'>('args.teamId'),
    // no isAuthenticated: errors can occur pre-auth (parity with the legacy Google Form flow)
    submitErrorFeedback: rateLimit({perMinute: 5, perHour: 20}),
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
    updateCommentContent: isMeetingMember<'Mutation.updateCommentContent'>('args.meetingId'),
    updateCreditCard: isViewerBillingLeader<'Mutation.updateCreditCard'>('args.orgId'),
    updateDragLocation: isTeamMember<'Mutation.updateDragLocation'>('args.input.teamId'),
    updateFacilitatorRotation:
      isTeamMemberOfMeeting<'Mutation.updateFacilitatorRotation'>('args.meetingId'),
    updateIntegrationRepoAccess:
      isTeamMember<'Mutation.updateIntegrationRepoAccess'>('args.teamId'),
    updateIntegrationDimensionField: isTeamMember<'Mutation.updateIntegrationDimensionField'>(
      'args.meetingId',
      'newMeetings'
    ),
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
    exportPagesToConfluence: and(
      isAuthenticated,
      hasPageAccess<'Mutation.exportPagesToConfluence'>('args.pageId', 'viewer'),
      rateLimit({perMinute: 10, perHour: 100})
    ),
    requestPageAccess: and(isAuthenticated, rateLimit({perMinute: 5, perHour: 20})),
    updatePage: and(isAuthenticated, hasPageAccess<'Mutation.updatePage'>('args.pageId', 'viewer')),
    updatePageAccess: and(
      isAuthenticated,
      hasPageAccess<'Mutation.updatePageAccess'>('args.pageId', 'viewer'),
      // limit looking up users by email
      rateLimit({perMinute: 50, perHour: 100})
    ),
    updatePageParentLink: and(
      isAuthenticated,
      hasPageAccess<'Mutation.updatePageParentLink'>('args.pageId', 'owner')
    ),
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
    // updateMeetingSeries: auth lives in the resolver (args.meetingSeriesId is a global ID
    // that the resolver unwraps via MeetingSeriesId.split before any dataloader lookup).
    updateReflectionContent: isMeetingMember<'Mutation.updateReflectionContent'>(
      'args.reflectionId',
      'retroReflections'
    ),
    updateReflectionGroupTitle: isMeetingMember<'Mutation.updateReflectionGroupTitle'>(
      'args.reflectionGroupId',
      'retroReflectionGroups'
    ),
    updateRetroMaxVotes: isMeetingMember<'Mutation.updateRetroMaxVotes'>('args.meetingId'),
    updateSCIM: hasOrgRole<'Mutation.updateSCIM'>('args.samlId', 'ORG_ADMIN', 'saml'),
    updateTask: isTeamMember<'Mutation.updateTask'>('args.updatedTask.id', 'tasks'),
    updateTaskDueDate: isTeamMember<'Mutation.updateTaskDueDate'>('args.taskId', 'tasks'),
    updateTeamName: isTeamMember<'Mutation.updateTeamName'>('args.updatedTeam.id'),
    updateTeamSortOrder: isTeamMember<'Mutation.updateTeamSortOrder'>('args.teamId'),
    updateTemplateCategory: isTeamMember<'Mutation.updateTemplateCategory'>(
      'args.templateId',
      'meetingTemplates'
    ),
    updateTemplatePromptDescription: isTeamMember<'Mutation.updateTemplatePromptDescription'>(
      'args.promptId',
      'templatePrompts'
    ),
    updateTemplatePromptGroupColor: isTeamMember<'Mutation.updateTemplatePromptGroupColor'>(
      'args.promptId',
      'templatePrompts'
    ),
    uploadIdPMetadata: hasOrgRole<'Mutation.uploadIdPMetadata'>('args.samlId', 'ORG_ADMIN', 'saml'),
    uploadOrgImage: isViewerBillingLeader<'Mutation.uploadOrgImage'>('args.orgId'),
    upsertTeamHealthQuestionCategory: isUserViewer<'Mutation.upsertTeamHealthQuestionCategory'>(
      'args.questionId',
      'teamHealthQuestions',
      'createdBy'
    ),
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
    resolveEmbedUrl: and(isAuthenticated, rateLimit({perMinute: 30, perHour: 300})),
    SAMLIdP: rateLimit({perMinute: 120, perHour: 3600}),
    verifiedInvitation: rateLimit({perMinute: 60, perHour: 1800})
  },
  PublicRoot: {
    page: and(
      rateLimit({perMinute: 20, perHour: 100}),
      hasPageAccess<'User.page'>('args.pageId', 'viewer')
    )
  },
  // A viewer outside the org (e.g. one who sees it in a page's access list) gets its identity
  // plus their own viewer-relative fields
  Organization: {
    '*': redactUnless(or(isSuperUser, isViewerOnOrg<'Organization.id'>('source.id'))),
    activeUserCounts: or(isSuperUser, isViewerOnOrg<'Organization.activeUserCounts'>('source.id')),
    id: allow,
    isBillingLeader: allow,
    isOrgAdmin: allow,
    name: allow,
    oauthAPIProvider: hasProviderAccess<'Organization.oauthAPIProvider'>('args.providerId'),
    picture: allow,
    report: and(
      or(isSuperUser, isViewerOnOrg<'Organization.report'>('source.id')),
      hasOrgFeatureFlag<'Organization.report'>('source.id', 'Reports'),
      rateLimit({perMinute: 120, perHour: 3000})
    ),
    reportTeamHealthStage: and(
      or(isSuperUser, isViewerOnOrg<'Organization.reportTeamHealthStage'>('source.id')),
      hasOrgFeatureFlag<'Organization.reportTeamHealthStage'>('source.id', 'Reports'),
      isReportTeamHealthCheck<'Organization.reportTeamHealthStage'>('source.id', 'args.meetingId'),
      rateLimit({perMinute: 120, perHour: 3000})
    ),
    pinnedReports: and(
      or(isSuperUser, isViewerOnOrg<'Organization.pinnedReports'>('source.id')),
      hasOrgFeatureFlag<'Organization.pinnedReports'>('source.id', 'Reports')
    ),
    recentReportQuestions: and(
      or(isSuperUser, isViewerOnOrg<'Organization.recentReportQuestions'>('source.id')),
      hasOrgFeatureFlag<'Organization.recentReportQuestions'>('source.id', 'Reports')
    ),
    saml: and(
      isViewerOnOrg<'Organization.saml'>('source.id'),
      isOrgTier<'Organization.saml'>('source.id', 'enterprise')
    ),
    samls: and(
      isViewerOnOrg<'Organization.samls'>('source.id'),
      isOrgTier<'Organization.samls'>('source.id', 'enterprise')
    ),
    viewerOrganizationUser: allow
  },
  PinnedReport: {
    report: rateLimit({perMinute: 120, perHour: 3000})
  },
  RetroReflectionGroup: {
    smartTitle: isSuperUser,
    voterIds: isSuperUser
  },
  // Anyone handed a Team gets its identity and their own viewer-relative fields. The rest of the org
  // also gets the billing basics, and an org leader can administer its members. Everything that
  // describes how the team works is for the team. scale/scales stay open because the activity
  // library reads them off MeetingTemplate.team for org- & public-scoped templates.
  Team: {
    '*': redactUnless(or(isSuperUser, isTeamMember<'Team.id'>('source.id'))),
    autoJoin: isOnTeamOrg,
    billingTier: isOnTeamOrg,
    createdAt: isOnTeamOrg,
    id: allow,
    isArchived: allow,
    isOrgAdmin: allow,
    isPublic: isOnTeamOrg,
    isViewerLead: allow,
    isViewerOnTeam: allow,
    lastMetAt: isOnTeamOrg,
    massInvitation: or(
      // TODO or rules run in parallel, make it go in serial since org_admin check is rare
      isTeamMember<'Team.massInvitation'>('source.id'),
      hasOrgRole<'Team.massInvitation'>('source.orgId', 'ORG_ADMIN')
    ),
    name: allow,
    orgId: allow,
    organization: isViewerOnOrg<'Team.organization'>('source.orgId'),
    scale: allow,
    scales: allow,
    tasks: canAdministerTeam,
    teamLead: or(
      isTeamMember<'Team.teamLead'>('source.id'),
      isViewerBillingLeader<'Team.teamLead'>('source.orgId')
    ),
    teamMembers: redactUnless(canAdministerTeam),
    teamMembersCount: or(
      isTeamMember<'Team.teamMembersCount'>('source.id'),
      isViewerBillingLeader<'Team.teamMembersCount'>('source.orgId'),
      isSuperUser,
      // anyone on the org can join a public team and see who is on it
      and(
        isTrue<'Team.teamMembersCount'>('source.isPublic'),
        isViewerOnOrg<'Team.teamMembersCount'>('source.orgId')
      )
    ),
    tier: isOnTeamOrg,
    viewerTeamMember: allow
  },
  TeamMember: {
    integrations: isUserViewer<'TeamMember.integrations'>('source.userId'),
    repoIntegrations: isUserViewer<'TeamMember.repoIntegrations'>('source.userId'),
    services: isUserViewer<'TeamMember.services'>('source.userId')
  },
  // Reports reach a result stage without going through its meeting, so the fields that lead into the
  // meeting stay with the team: org leaders read the results, never the meeting or its discussion
  TeamHealthResultStage: {
    meeting: isTeamMemberOfMeeting<'TeamHealthResultStage.meeting'>('source.meetingId'),
    phase: isTeamMemberOfMeeting<'TeamHealthResultStage.phase'>('source.meetingId'),
    discussion: isTeamMemberOfMeeting<'TeamHealthResultStage.discussion'>('source.meetingId'),
    readyUserIds: isTeamMemberOfMeeting<'TeamHealthResultStage.readyUserIds'>('source.meetingId')
  },
  IntegrationService: {
    auth: isUserViewer<'IntegrationService.auth'>('source.userId'),
    grantedScopes: isUserViewer<'IntegrationService.grantedScopes'>('source.userId'),
    repos: isUserViewer<'IntegrationService.repos'>('source.userId'),
    searchQueries: isUserViewer<'IntegrationService.searchQueries'>('source.userId')
  },
  AzureDevOpsIntegrationService: {
    repoAccess: isUserViewer<'AzureDevOpsIntegrationService.repoAccess'>('source.userId'),
    availableRepos: isUserViewer<'AzureDevOpsIntegrationService.availableRepos'>('source.userId')
  },
  AzureDevOpsIntegration: {
    workItems: isUserViewer<'AzureDevOpsIntegration.workItems'>('source.userId')
  },
  // Another user's User object is a public profile, plus their presence for anyone in one of their orgs.
  // Everything else is for the user themself
  User: {
    '*': redactUnless(or(isSuperUser, isUserSelf)),
    archivedTasks: and(isUserSelf, isTeamMember<'User.archivedTasks'>('args.teamId')),
    invoices: and(isUserSelf, isViewerBillingLeader<'User.invoices'>('args.orgId')),
    archivedTasksCount: and(isUserSelf, isTeamMember<'User.archivedTasksCount'>('args.teamId')),
    company: isSuperUser,
    discussion: and(isUserSelf, isTeamMember<'User.discussion'>('args.id', 'discussions')),
    domains: or(isSuperUser, isUserSelf),
    email: allow,
    freeCustomRetroTemplatesRemaining: isUserSelf,
    freeCustomPokerTemplatesRemaining: isUserSelf,
    freeCustomStandupTemplatesRemaining: isUserSelf,
    id: allow,
    inactive: isOnUserOrg,
    isConnected: isOnUserOrg,
    lastSeenAt: isOnUserOrg,
    meeting: and(isUserSelf, isTeamMemberOfMeeting<'User.meeting'>('args.meetingId')),
    organization: or(
      isSuperUser,
      and(isUserSelf, isViewerOnOrg<'User.organization'>('args.orgId'))
    ),
    organizationUser: or(
      isSuperUser,
      and(isUserSelf, isViewerOnOrg<'User.organizationUser'>('args.orgId'))
    ),
    oauthAuthorizationRequest: and(isUserSelf, hasTokenAudience(['action'])),
    personalAccessTokens: isUserSelf,
    picture: allow,
    preferredName: allow,
    rasterPicture: allow,
    meetingMember: and(isUserSelf, isTeamMemberOfMeeting<'User.meetingMember'>('args.meetingId')),
    team: or(
      isSuperUser,
      and(
        isUserSelf,
        or(
          isTeamMember<'User.team'>('args.teamId'),
          isViewerBillingLeader<'User.team'>('args.teamId', 'teams')
        )
      )
    ),
    teamMember: and(isUserSelf, isTeamMember<'User.teamMember'>('args.teamId'))
  },
  // Anyone handed a Page (an ancestor in a breadcrumb, a notification) gets the fields to show and
  // link to it, plus their own access to it
  Page: {
    '*': redactUnless(hasPageAccess<'Page.id'>('source.id', 'viewer')),
    access: allow,
    id: allow,
    team: allow,
    teamId: allow,
    title: allow
  },
  // Who has access is for those granted access. Anyone with a public link only sees what the link grants
  PageAccess: {
    guests: redactUnless(
      hasPageAccess<'PageAccess.guests'>('source.id', 'viewer', {ignorePublicLink: true})
    ),
    organizations: redactUnless(
      hasPageAccess<'PageAccess.organizations'>('source.id', 'viewer', {ignorePublicLink: true})
    ),
    pendingRequests: redactUnless(
      hasPageAccess<'PageAccess.pendingRequests'>('source.id', 'owner')
    ),
    teams: redactUnless(
      hasPageAccess<'PageAccess.teams'>('source.id', 'viewer', {ignorePublicLink: true})
    ),
    users: redactUnless(
      hasPageAccess<'PageAccess.users'>('source.id', 'viewer', {ignorePublicLink: true})
    )
  }
}

export default permissionMap
