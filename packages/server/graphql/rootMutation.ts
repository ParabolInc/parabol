import {GraphQLObjectType} from 'graphql'
import {GQLContext} from './graphql'
import addAtlassianAuth from './mutations/addAtlassianAuth'
import addGitHubAuth from './mutations/addGitHubAuth'
import addOrg from './mutations/addOrg'
import addPokerTemplateDimension from './mutations/addPokerTemplateDimension'
import addPokerTemplateScale from './mutations/addPokerTemplateScale'
import addPokerTemplateScaleValue from './mutations/addPokerTemplateScaleValue'
import addTeam from './mutations/addTeam'
import archiveOrganization from './mutations/archiveOrganization'
import archiveTeam from './mutations/archiveTeam'
import archiveTimelineEvent from './mutations/archiveTimelineEvent'
import changeTaskTeam from './mutations/changeTaskTeam'
import createMassInvitation from './mutations/createMassInvitation'
import createOAuth1AuthorizeUrl from './mutations/createOAuth1AuthorizeUrl'
import createPoll from './mutations/createPoll'
import createReflection from './mutations/createReflection'
import createTask from './mutations/createTask'
import createTaskIntegration from './mutations/createTaskIntegration'
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
import flagReadyToAdvance from './mutations/flagReadyToAdvance'
import invalidateSessions from './mutations/invalidateSessions'
import inviteToTeam from './mutations/inviteToTeam'
import joinMeeting from './mutations/joinMeeting'
import movePokerTemplateDimension from './mutations/movePokerTemplateDimension'
import movePokerTemplateScaleValue from './mutations/movePokerTemplateScaleValue'
import moveTeamToOrg from './mutations/moveTeamToOrg'
import navigateMeeting from './mutations/navigateMeeting'
import persistGitHubSearchQuery from './mutations/persistGitHubSearchQuery'
import persistJiraSearchQuery from './mutations/persistJiraSearchQuery'
import pokerAnnounceDeckHover from './mutations/pokerAnnounceDeckHover'
import pokerResetDimension from './mutations/pokerResetDimension'
import pokerRevealVotes from './mutations/pokerRevealVotes'
import pokerTemplateDimensionUpdateDescription from './mutations/pokerTemplateDimensionUpdateDescription'
import promoteNewMeetingFacilitator from './mutations/promoteNewMeetingFacilitator'
import promoteToTeamLead from './mutations/promoteToTeamLead'
import pushInvitation from './mutations/pushInvitation'
import removeAtlassianAuth from './mutations/removeAtlassianAuth'
import removeGitHubAuth from './mutations/removeGitHubAuth'
import removeIntegrationProvider from './mutations/removeIntegrationProvider'
import removePokerTemplateDimension from './mutations/removePokerTemplateDimension'
import removePokerTemplateScale from './mutations/removePokerTemplateScale'
import removePokerTemplateScaleValue from './mutations/removePokerTemplateScaleValue'
import removeReflectTemplate from './mutations/removeReflectTemplate'
import removeReflection from './mutations/removeReflection'
import removeSlackAuth from './mutations/removeSlackAuth'
import removeTeamMember from './mutations/removeTeamMember'
import renameMeeting from './mutations/renameMeeting'
import renameMeetingTemplate from './mutations/renameMeetingTemplate'
import renamePokerTemplateDimension from './mutations/renamePokerTemplateDimension'
import renamePokerTemplateScale from './mutations/renamePokerTemplateScale'
import resetPassword from './mutations/resetPassword'
import resetRetroMeetingToGroupStage from './mutations/resetRetroMeetingToGroupStage'
import selectTemplate from './mutations/selectTemplate'
import setAppLocation from './mutations/setAppLocation'
import setNotificationStatus from './mutations/setNotificationStatus'
import setPhaseFocus from './mutations/setPhaseFocus'
import setPokerSpectate from './mutations/setPokerSpectate'
import setStageTimer from './mutations/setStageTimer'
import setTaskEstimate from './mutations/setTaskEstimate'
import setTaskHighlight from './mutations/setTaskHighlight'
import startDraggingReflection from './mutations/startDraggingReflection'
import startSprintPoker from './mutations/startSprintPoker'
import toggleTeamDrawer from './mutations/toggleTeamDrawer'
import updateAzureDevOpsDimensionField from './mutations/updateAzureDevOpsDimensionField'
import updateDragLocation from './mutations/updateDragLocation'
import updateGitHubDimensionField from './mutations/updateGitHubDimensionField'
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
import voteForPokerStory from './mutations/voteForPokerStory'
import voteForReflectionGroup from './mutations/voteForReflectionGroup'

export default new GraphQLObjectType<any, GQLContext>({
  name: 'Mutation',
  fields: () =>
    ({
      addAtlassianAuth,
      addPokerTemplateDimension,
      addPokerTemplateScale,
      addPokerTemplateScaleValue,
      addGitHubAuth,
      addOrg,
      addTeam,
      archiveOrganization,
      archiveTeam,
      archiveTimelineEvent,
      changeTaskTeam,
      setNotificationStatus,
      createTaskIntegration,
      createMassInvitation,
      createOAuth1AuthorizeUrl,
      createReflection,
      createTask,
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
      moveTeamToOrg,
      navigateMeeting,
      persistJiraSearchQuery,
      pushInvitation,
      promoteNewMeetingFacilitator,
      promoteToTeamLead,
      pokerTemplateDimensionUpdateDescription,
      removeAtlassianAuth,
      removeGitHubAuth,
      removeReflectTemplate,
      removePokerTemplateDimension,
      renameMeeting,
      renameMeetingTemplate,
      renamePokerTemplateDimension,
      renamePokerTemplateScale,
      removePokerTemplateScale,
      removePokerTemplateScaleValue,
      removeReflection,
      removeSlackAuth,
      removeTeamMember,
      resetPassword,
      resetRetroMeetingToGroupStage,
      selectTemplate,
      setAppLocation,
      setPhaseFocus,
      setStageTimer,
      startDraggingReflection,
      startSprintPoker,
      setTaskHighlight,
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
      removeIntegrationProvider,
      updateAzureDevOpsDimensionField
    }) as any
})
