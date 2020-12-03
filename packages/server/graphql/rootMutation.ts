import {GraphQLObjectType} from 'graphql'
import {GQLContext, InternalContext} from './graphql'
import acceptTeamInvitation from './mutations/acceptTeamInvitation'
import addAgendaItem from './mutations/addAgendaItem'
import addAtlassianAuth from './mutations/addAtlassianAuth'
import addComment from './mutations/addComment'
import addFeatureFlag from './mutations/addFeatureFlag'
import addGitHubAuth from './mutations/addGitHubAuth'
import addOrg from './mutations/addOrg'
import addPokerTemplate from './mutations/addPokerTemplate'
import addPokerTemplateDimension from './mutations/addPokerTemplateDimension'
import addPokerTemplateScale from './mutations/addPokerTemplateScale'
import addPokerTemplateScaleValue from './mutations/addPokerTemplateScaleValue'
import addReactjiToReactable from './mutations/addReactjiToReactable'
import addReactjiToReflection from './mutations/addReactjiToReflection'
import addReflectTemplate from './mutations/addReflectTemplate'
import addReflectTemplatePrompt from './mutations/addReflectTemplatePrompt'
import addSlackAuth from './mutations/addSlackAuth'
import addTeam from './mutations/addTeam'
import archiveOrganization from './mutations/archiveOrganization'
import archiveTeam from './mutations/archiveTeam'
import archiveTimelineEvent from './mutations/archiveTimelineEvent'
import autoGroupReflections from './mutations/autoGroupReflections'
import changeTaskTeam from './mutations/changeTaskTeam'
import createGitHubIssue from './mutations/createGitHubIssue'
import createImposterToken from './mutations/createImposterToken'
import createJiraTaskIntegration from './mutations/createJiraTaskIntegration'
import createMassInvitation from './mutations/createMassInvitation'
import createOrgPicturePutUrl from './mutations/createOrgPicturePutUrl'
import createReflection from './mutations/createReflection'
import createTask from './mutations/createTask'
import createUserPicturePutUrl from './mutations/createUserPicturePutUrl'
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
import endDraggingReflection from './mutations/endDraggingReflection'
import endNewMeeting from './mutations/endNewMeeting'
import endSprintPoker from './mutations/endSprintPoker'
import flagReadyToAdvance from './mutations/flagReadyToAdvance'
import inactivateUser from './mutations/inactivateUser'
import invalidateSessions from './mutations/invalidateSessions'
import inviteToTeam from './mutations/inviteToTeam'
import jiraCreateIssue from './mutations/jiraCreateIssue'
import loginWithGoogle from './mutations/loginWithGoogle'
import loginWithPassword from './mutations/loginWithPassword'
import movePokerTemplateDimension from './mutations/movePokerTemplateDimension'
import moveReflectTemplatePrompt from './mutations/moveReflectTemplatePrompt'
import moveTeamToOrg from './mutations/moveTeamToOrg'
import navigateMeeting from './mutations/navigateMeeting'
import newMeetingCheckIn from './mutations/newMeetingCheckIn'
import payLater from './mutations/payLater'
import promoteNewMeetingFacilitator from './mutations/promoteNewMeetingFacilitator'
import promoteToTeamLead from './mutations/promoteToTeamLead'
import pushInvitation from './mutations/pushInvitation'
import reflectTemplatePromptUpdateDescription from './mutations/reflectTemplatePromptUpdateDescription'
import pokerTemplateDimensionUpdateDescription from './mutations/pokerTemplateDimensionUpdateDescription'
import reflectTemplatePromptUpdateGroupColor from './mutations/reflectTemplatePromptUpdateGroupColor'
import removeAgendaItem from './mutations/removeAgendaItem'
import removeAtlassianAuth from './mutations/removeAtlassianAuth'
import removeGitHubAuth from './mutations/removeGitHubAuth'
import removeOrgUser from './mutations/removeOrgUser'
import removePokerTemplate from './mutations/removePokerTemplate'
import removeReflection from './mutations/removeReflection'
import removeReflectTemplate from './mutations/removeReflectTemplate'
import removeReflectTemplatePrompt from './mutations/removeReflectTemplatePrompt'
import removePokerTemplateDimension from './mutations/removePokerTemplateDimension'
import removeSlackAuth from './mutations/removeSlackAuth'
import removeTeamMember from './mutations/removeTeamMember'
import renameMeeting from './mutations/renameMeeting'
import renameMeetingTemplate from './mutations/renameMeetingTemplate'
import renameReflectTemplatePrompt from './mutations/renameReflectTemplatePrompt'
import renamePokerTemplateDimension from './mutations/renamePokerTemplateDimension'
import renamePokerTemplateScale from './mutations/renamePokerTemplateScale'
import removePokerTemplateScale from './mutations/removePokerTemplateScale'
import removePokerTemplateScaleValue from './mutations/removePokerTemplateScaleValue'
import resetMeetingToStage from './mutations/resetMeetingToStage'
import resetPassword from './mutations/resetPassword'
import segmentEventTrack from './mutations/segmentEventTrack'
import selectTemplate from './mutations/selectTemplate'
import setAppLocation from './mutations/setAppLocation'
import setCheckInEnabled from './mutations/setCheckInEnabled'
import setNotificationStatus from './mutations/setNotificationStatus'
import setOrgUserRole from './mutations/setOrgUserRole'
import setPhaseFocus from './mutations/setPhaseFocus'
import setSlackNotification from './mutations/setSlackNotification'
import setStageTimer from './mutations/setStageTimer'
import signUpWithPassword from './mutations/signUpWithPassword'
import startDraggingReflection from './mutations/startDraggingReflection'
import startCheckIn from './mutations/startCheckIn'
import startNewMeeting from './mutations/startNewMeeting'
import startRetrospective from './mutations/startRetrospective'
import startSprintPoker from './mutations/startSprintPoker'
import toggleAgendaList from './mutations/toggleAgendaList'
import updateAgendaItem from './mutations/updateAgendaItem'
import updateCommentContent from './mutations/updateCommentContent'
import updateCreditCard from './mutations/updateCreditCard'
import updateDragLocation from './mutations/updateDragLocation'
import updateNewCheckInQuestion from './mutations/updateNewCheckInQuestion'
import updateOrg from './mutations/updateOrg'
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
import voteForReflectionGroup from './mutations/voteForReflectionGroup'
import updatePokerScope from './mutations/updatePokerScope'
import voteForPokerStory from './mutations/voteForPokerStory'
import endCheckIn from './mutations/endCheckIn'
import endRetrospective from './mutations/endRetrospective'
import pokerRevealVotes from './mutations/pokerRevealVotes'
import pokerResetDimension from './mutations/pokerResetDimension'
import pokerAnnounceDeckHover from './mutations/pokerAnnounceDeckHover'
import pokerSetFinalScore from './mutations/pokerSetFinalScore'
import updateJiraDimensionField from './mutations/updateJiraDimensionField'
import persistJiraSearchQuery from './mutations/persistJiraSearchQuery'

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

      // DEPRECATED, delete after 4.25.0
      addReactjiToReflection,

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
      createGitHubIssue,
      createJiraTaskIntegration,
      createMassInvitation,
      createOrgPicturePutUrl,
      createReflection,
      createTask,
      createUserPicturePutUrl,
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
      endNewMeeting,
      endRetrospective,
      flagReadyToAdvance,
      inactivateUser,
      invalidateSessions,
      inviteToTeam,
      jiraCreateIssue,
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
      resetMeetingToStage,
      resetPassword,
      segmentEventTrack,
      selectTemplate,
      setAppLocation,
      setCheckInEnabled,
      setOrgUserRole,
      setPhaseFocus,
      setStageTimer,
      setSlackNotification,
      signUpWithPassword,
      startDraggingReflection,
      startCheckIn,
      startNewMeeting,
      startRetrospective,
      startSprintPoker,
      toggleAgendaList,
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
      pokerSetFinalScore,
      updateJiraDimensionField
    } as any)
})
