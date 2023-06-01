import {GraphQLObjectType} from 'graphql'
import {GQLContext} from './graphql'
import addAgendaItem from './mutations/addAgendaItem'
import addAtlassianAuth from './mutations/addAtlassianAuth'
import addComment from './mutations/addComment'
import addGitHubAuth from './mutations/addGitHubAuth'
import addIntegrationProvider from './mutations/addIntegrationProvider'
import addOrg from './mutations/addOrg'
import addPokerTemplate from './mutations/addPokerTemplate'
import addPokerTemplateDimension from './mutations/addPokerTemplateDimension'
import addPokerTemplateScale from './mutations/addPokerTemplateScale'
import addPokerTemplateScaleValue from './mutations/addPokerTemplateScaleValue'
import addReactjiToReactable from './mutations/addReactjiToReactable'
import addReflectTemplate from './mutations/addReflectTemplate'
import addReflectTemplatePrompt from './mutations/addReflectTemplatePrompt'
import addSlackAuth from './mutations/addSlackAuth'
import addTeam from './mutations/addTeam'
import addTeamMemberIntegrationAuth from './mutations/addTeamMemberIntegrationAuth'
import archiveOrganization from './mutations/archiveOrganization'
import archiveTeam from './mutations/archiveTeam'
import archiveTimelineEvent from './mutations/archiveTimelineEvent'
import autoGroupReflections from './mutations/autoGroupReflections'
import changeTaskTeam from './mutations/changeTaskTeam'
import createMassInvitation from './mutations/createMassInvitation'
import createOAuth1AuthorizeUrl from './mutations/createOAuth1AuthorizeUrl'
import createPoll from './mutations/createPoll'
import createReflection from './mutations/createReflection'
import createTask from './mutations/createTask'
import createTaskIntegration from './mutations/createTaskIntegration'
import deleteComment from './mutations/deleteComment'
import deleteTask from './mutations/deleteTask'
import deleteUser from './mutations/deleteUser'
import denyPushInvitation from './mutations/denyPushInvitation'
import dismissNewFeature from './mutations/dismissNewFeature'
import dismissSuggestedAction from './mutations/dismissSuggestedAction'
import downgradeToStarter from './mutations/downgradeToStarter'
import dragDiscussionTopic from './mutations/dragDiscussionTopic'
import dragEstimatingTask from './mutations/dragEstimatingTask'
import editCommenting from './mutations/editCommenting'
import editReflection from './mutations/editReflection'
import editTask from './mutations/editTask'
import emailPasswordReset from './mutations/emailPasswordReset'
import endCheckIn from './mutations/endCheckIn'
import endDraggingReflection from './mutations/endDraggingReflection'
import endRetrospective from './mutations/endRetrospective'
import endSprintPoker from './mutations/endSprintPoker'
import endTeamPrompt from './mutations/endTeamPrompt'
import flagReadyToAdvance from './mutations/flagReadyToAdvance'
import invalidateSessions from './mutations/invalidateSessions'
import inviteToTeam from './mutations/inviteToTeam'
import joinMeeting from './mutations/joinMeeting'
import movePokerTemplateDimension from './mutations/movePokerTemplateDimension'
import movePokerTemplateScaleValue from './mutations/movePokerTemplateScaleValue'
import moveReflectTemplatePrompt from './mutations/moveReflectTemplatePrompt'
import moveTeamToOrg from './mutations/moveTeamToOrg'
import navigateMeeting from './mutations/navigateMeeting'
import newMeetingCheckIn from './mutations/newMeetingCheckIn'
import payLater from './mutations/payLater'
import persistGitHubSearchQuery from './mutations/persistGitHubSearchQuery'
import persistJiraSearchQuery from './mutations/persistJiraSearchQuery'
import pokerAnnounceDeckHover from './mutations/pokerAnnounceDeckHover'
import pokerResetDimension from './mutations/pokerResetDimension'
import pokerRevealVotes from './mutations/pokerRevealVotes'
import pokerTemplateDimensionUpdateDescription from './mutations/pokerTemplateDimensionUpdateDescription'
import promoteNewMeetingFacilitator from './mutations/promoteNewMeetingFacilitator'
import promoteToTeamLead from './mutations/promoteToTeamLead'
import pushInvitation from './mutations/pushInvitation'
import reflectTemplatePromptUpdateDescription from './mutations/reflectTemplatePromptUpdateDescription'
import reflectTemplatePromptUpdateGroupColor from './mutations/reflectTemplatePromptUpdateGroupColor'
import removeAgendaItem from './mutations/removeAgendaItem'
import removeAtlassianAuth from './mutations/removeAtlassianAuth'
import removeGitHubAuth from './mutations/removeGitHubAuth'
import removeIntegrationProvider from './mutations/removeIntegrationProvider'
import removeOrgUser from './mutations/removeOrgUser'
import removePokerTemplate from './mutations/removePokerTemplate'
import removePokerTemplateDimension from './mutations/removePokerTemplateDimension'
import removePokerTemplateScale from './mutations/removePokerTemplateScale'
import removePokerTemplateScaleValue from './mutations/removePokerTemplateScaleValue'
import removeReflection from './mutations/removeReflection'
import removeReflectTemplate from './mutations/removeReflectTemplate'
import removeReflectTemplatePrompt from './mutations/removeReflectTemplatePrompt'
import removeSlackAuth from './mutations/removeSlackAuth'
import removeTeamMember from './mutations/removeTeamMember'
import removeTeamMemberIntegrationAuth from './mutations/removeTeamMemberIntegrationAuth'
import renameMeeting from './mutations/renameMeeting'
import renameMeetingTemplate from './mutations/renameMeetingTemplate'
import renamePokerTemplateDimension from './mutations/renamePokerTemplateDimension'
import renamePokerTemplateScale from './mutations/renamePokerTemplateScale'
import renameReflectTemplatePrompt from './mutations/renameReflectTemplatePrompt'
import resetPassword from './mutations/resetPassword'
import resetRetroMeetingToGroupStage from './mutations/resetRetroMeetingToGroupStage'
import segmentEventTrack from './mutations/segmentEventTrack'
import selectTemplate from './mutations/selectTemplate'
import setAppLocation from './mutations/setAppLocation'
import setDefaultSlackChannel from './mutations/setDefaultSlackChannel'
import setNotificationStatus from './mutations/setNotificationStatus'
import setPhaseFocus from './mutations/setPhaseFocus'
import setPokerSpectate from './mutations/setPokerSpectate'
import setSlackNotification from './mutations/setSlackNotification'
import setStageTimer from './mutations/setStageTimer'
import setTaskEstimate from './mutations/setTaskEstimate'
import setTaskHighlight from './mutations/setTaskHighlight'
import startCheckIn from './mutations/startCheckIn'
import startDraggingReflection from './mutations/startDraggingReflection'
import startRetrospective from './mutations/startRetrospective'
import startSprintPoker from './mutations/startSprintPoker'
import toggleTeamDrawer from './mutations/toggleTeamDrawer'
import updateAgendaItem from './mutations/updateAgendaItem'
import updateAzureDevOpsDimensionField from './mutations/updateAzureDevOpsDimensionField'
import updateCommentContent from './mutations/updateCommentContent'
import updateCreditCard from './mutations/updateCreditCard'
import updateDragLocation from './mutations/updateDragLocation'
import updateGitHubDimensionField from './mutations/updateGitHubDimensionField'
import updateIntegrationProvider from './mutations/updateIntegrationProvider'
import updateNewCheckInQuestion from './mutations/updateNewCheckInQuestion'
import updatePokerScope from './mutations/updatePokerScope'
import updatePokerTemplateDimensionScale from './mutations/updatePokerTemplateDimensionScale'
import updatePokerTemplateScaleValue from './mutations/updatePokerTemplateScaleValue'
import updateReflectionContent from './mutations/updateReflectionContent'
import updateReflectionGroupTitle from './mutations/updateReflectionGroupTitle'
import updateRetroMaxVotes from './mutations/updateRetroMaxVotes'
import updateTask from './mutations/updateTask'
import updateTaskDueDate from './mutations/updateTaskDueDate'
import updateTeamName from './mutations/updateTeamName'
import updateTemplateScope from './mutations/updateTemplateScope'
import upgradeToTeamTier from './mutations/upgradeToTeamTier'
import voteForPokerStory from './mutations/voteForPokerStory'
import voteForReflectionGroup from './mutations/voteForReflectionGroup'

export default new GraphQLObjectType<any, GQLContext>({
  name: 'Mutation',
  fields: () =>
    ({
      addAgendaItem,
      addAtlassianAuth,
      addComment,
      addPokerTemplate,
      addPokerTemplateDimension,
      addPokerTemplateScale,
      addPokerTemplateScaleValue,
      addReactjiToReactable,
      addReflectTemplate,
      addReflectTemplatePrompt,
      addSlackAuth,
      addGitHubAuth,
      addOrg,
      addTeam,
      archiveOrganization,
      archiveTeam,
      archiveTimelineEvent,
      autoGroupReflections,
      changeTaskTeam,
      setNotificationStatus,
      createTaskIntegration,
      createMassInvitation,
      createOAuth1AuthorizeUrl,
      createReflection,
      createTask,
      deleteComment,
      deleteTask,
      deleteUser,
      denyPushInvitation,
      dismissNewFeature,
      dismissSuggestedAction,
      downgradeToStarter,
      dragDiscussionTopic,
      dragEstimatingTask,
      emailPasswordReset,
      editCommenting,
      endSprintPoker,
      editReflection,
      editTask,
      endCheckIn,
      endDraggingReflection,
      endRetrospective,
      flagReadyToAdvance,
      invalidateSessions,
      inviteToTeam,
      movePokerTemplateDimension,
      moveReflectTemplatePrompt,
      moveTeamToOrg,
      navigateMeeting,
      newMeetingCheckIn,
      payLater,
      persistJiraSearchQuery,
      pushInvitation,
      promoteNewMeetingFacilitator,
      promoteToTeamLead,
      reflectTemplatePromptUpdateDescription,
      pokerTemplateDimensionUpdateDescription,
      reflectTemplatePromptUpdateGroupColor,
      removeAgendaItem,
      removeAtlassianAuth,
      removeGitHubAuth,
      removeOrgUser,
      removePokerTemplate,
      removeReflectTemplate,
      removeReflectTemplatePrompt,
      removePokerTemplateDimension,
      renameMeeting,
      renameMeetingTemplate,
      renameReflectTemplatePrompt,
      renamePokerTemplateDimension,
      renamePokerTemplateScale,
      removePokerTemplateScale,
      removePokerTemplateScaleValue,
      removeReflection,
      removeSlackAuth,
      removeTeamMember,
      resetPassword,
      resetRetroMeetingToGroupStage,
      segmentEventTrack,
      selectTemplate,
      setAppLocation,
      setDefaultSlackChannel,
      setPhaseFocus,
      setStageTimer,
      setSlackNotification,
      startDraggingReflection,
      startCheckIn,
      startRetrospective,
      startSprintPoker,
      setTaskHighlight,
      updateAgendaItem,
      updateCommentContent,
      updateCreditCard,
      updatePokerTemplateDimensionScale,
      updatePokerTemplateScaleValue,
      updateNewCheckInQuestion,
      updateDragLocation,
      updatePokerScope,
      updateReflectionContent,
      updateReflectionGroupTitle,
      updateRetroMaxVotes,
      updateTask,
      updateTaskDueDate,
      updateTeamName,
      updateTemplateScope,
      upgradeToTeamTier,
      voteForReflectionGroup,
      voteForPokerStory,
      pokerRevealVotes,
      pokerResetDimension,
      pokerAnnounceDeckHover,
      movePokerTemplateScaleValue,
      joinMeeting,
      setPokerSpectate,
      persistGitHubSearchQuery,
      setTaskEstimate,
      toggleTeamDrawer,
      updateGitHubDimensionField,
      createPoll,
      addTeamMemberIntegrationAuth,
      addIntegrationProvider,
      updateIntegrationProvider,
      removeIntegrationProvider,
      removeTeamMemberIntegrationAuth,
      endTeamPrompt,
      updateAzureDevOpsDimensionField
    } as any)
})
