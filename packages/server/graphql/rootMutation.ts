import {GraphQLObjectType} from 'graphql'
import {GQLContext, InternalContext} from './graphql'
import acceptTeamInvitation from './mutations/acceptTeamInvitation'
import addAgendaItem from './mutations/addAgendaItem'
import addAtlassianAuth from './mutations/addAtlassianAuth'
import addComment from './mutations/addComment'
import addFeatureFlag from './mutations/addFeatureFlag'
import addGitHubAuth from './mutations/addGitHubAuth'
import addIntegrationProvider from './mutations/addIntegrationProvider'
import addMissingJiraField from './mutations/addMissingJiraField'
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
import createImposterToken from './mutations/createImposterToken'
import createTaskIntegration from './mutations/createTaskIntegration'
import createMassInvitation from './mutations/createMassInvitation'
import createOAuth1AuthorizeUrl from './mutations/createOAuth1AuthorizeUrl'
import createPoll from './mutations/createPoll'
import createReflection from './mutations/createReflection'
import createTask from './mutations/createTask'
import deleteComment from './mutations/deleteComment'
import deleteTask from './mutations/deleteTask'
import deleteUser from './mutations/deleteUser'
import denyPushInvitation from './mutations/denyPushInvitation'
import dismissNewFeature from './mutations/dismissNewFeature'
import dismissSuggestedAction from './mutations/dismissSuggestedAction'
import downgradeToPersonal from './mutations/downgradeToPersonal'
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
import inactivateUser from './mutations/inactivateUser'
import invalidateSessions from './mutations/invalidateSessions'
import inviteToTeam from './mutations/inviteToTeam'
import joinMeeting from './mutations/joinMeeting'
import loginWithGoogle from './mutations/loginWithGoogle'
import loginWithPassword from './mutations/loginWithPassword'
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
import setCheckInEnabled from './mutations/setCheckInEnabled'
import setDefaultSlackChannel from './mutations/setDefaultSlackChannel'
import setNotificationStatus from './mutations/setNotificationStatus'
import setOrgUserRole from './mutations/setOrgUserRole'
import setPhaseFocus from './mutations/setPhaseFocus'
import setPokerSpectate from './mutations/setPokerSpectate'
import setSlackNotification from './mutations/setSlackNotification'
import setStageTimer from './mutations/setStageTimer'
import setTaskEstimate from './mutations/setTaskEstimate'
import signUpWithPassword from './mutations/signUpWithPassword'
import startCheckIn from './mutations/startCheckIn'
import startDraggingReflection from './mutations/startDraggingReflection'
import startRetrospective from './mutations/startRetrospective'
import startSprintPoker from './mutations/startSprintPoker'
import setTaskHighlight from './mutations/setTaskHighlight'
import toggleTeamDrawer from './mutations/toggleTeamDrawer'
import updateAgendaItem from './mutations/updateAgendaItem'
import updateCommentContent from './mutations/updateCommentContent'
import updateCreditCard from './mutations/updateCreditCard'
import updateDragLocation from './mutations/updateDragLocation'
import updateGitHubDimensionField from './mutations/updateGitHubDimensionField'
import updateIntegrationProvider from './mutations/updateIntegrationProvider'
import updateJiraDimensionField from './mutations/updateJiraDimensionField'
import updateNewCheckInQuestion from './mutations/updateNewCheckInQuestion'
import updateOrg from './mutations/updateOrg'
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
import updateUserProfile from './mutations/updateUserProfile'
import upgradeToPro from './mutations/upgradeToPro'
import uploadOrgImage from './mutations/uploadOrgImage'
import uploadUserImage from './mutations/uploadUserImage'
import verifyEmail from './mutations/verifyEmail'
import voteForPokerStory from './mutations/voteForPokerStory'
import startTeamPrompt from './mutations/startTeamPrompt'
import voteForReflectionGroup from './mutations/voteForReflectionGroup'

interface Context extends InternalContext, GQLContext {}

export default new GraphQLObjectType<any, Context>({
  name: 'Mutation',
  fields: () =>
    ({
      acceptTeamInvitation,
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
      addFeatureFlag,
      addGitHubAuth,
      addOrg,
      addTeam,
      archiveOrganization,
      archiveTeam,
      archiveTimelineEvent,
      autoGroupReflections,
      changeTaskTeam,
      setNotificationStatus,
      createImposterToken,
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
      downgradeToPersonal,
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
      inactivateUser,
      invalidateSessions,
      inviteToTeam,
      loginWithGoogle,
      loginWithPassword,
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
      setCheckInEnabled,
      setDefaultSlackChannel,
      setOrgUserRole,
      setPhaseFocus,
      setStageTimer,
      setSlackNotification,
      signUpWithPassword,
      startDraggingReflection,
      startCheckIn,
      startRetrospective,
      startSprintPoker,
      setTaskHighlight,
      updateAgendaItem,
      updateCommentContent,
      updateCreditCard,
      updateOrg,
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
      updateUserProfile,
      upgradeToPro,
      uploadOrgImage,
      uploadUserImage,
      verifyEmail,
      voteForReflectionGroup,
      voteForPokerStory,
      pokerRevealVotes,
      pokerResetDimension,
      pokerAnnounceDeckHover,
      movePokerTemplateScaleValue,
      updateJiraDimensionField,
      joinMeeting,
      addMissingJiraField,
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
      startTeamPrompt
    } as any)
})
