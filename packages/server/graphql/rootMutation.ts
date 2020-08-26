import {GraphQLObjectType} from 'graphql'
import {GQLContext, InternalContext} from './graphql'
import acceptTeamInvitation from './mutations/acceptTeamInvitation'
import addAgendaItem from './mutations/addAgendaItem'
import addAtlassianAuth from './mutations/addAtlassianAuth'
import addComment from './mutations/addComment'
import addFeatureFlag from './mutations/addFeatureFlag'
import addGitHubAuth from './mutations/addGitHubAuth'
import addOrg from './mutations/addOrg'
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
import createJiraIssue from './mutations/createJiraIssue'
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
import editReflection from './mutations/editReflection'
import editTask from './mutations/editTask'
import emailPasswordReset from './mutations/emailPasswordReset'
import endDraggingReflection from './mutations/endDraggingReflection'
import endNewMeeting from './mutations/endNewMeeting'
import flagReadyToAdvance from './mutations/flagReadyToAdvance'
import inactivateUser from './mutations/inactivateUser'
import invalidateSessions from './mutations/invalidateSessions'
import inviteToTeam from './mutations/inviteToTeam'
import loginWithGoogle from './mutations/loginWithGoogle'
import loginWithPassword from './mutations/loginWithPassword'
import moveReflectTemplatePrompt from './mutations/moveReflectTemplatePrompt'
import moveTeamToOrg from './mutations/moveTeamToOrg'
import navigateMeeting from './mutations/navigateMeeting'
import newMeetingCheckIn from './mutations/newMeetingCheckIn'
import payLater from './mutations/payLater'
import promoteNewMeetingFacilitator from './mutations/promoteNewMeetingFacilitator'
import promoteToTeamLead from './mutations/promoteToTeamLead'
import pushInvitation from './mutations/pushInvitation'
import reflectTemplatePromptUpdateDescription from './mutations/reflectTemplatePromptUpdateDescription'
import reflectTemplatePromptUpdateGroupColor from './mutations/reflectTemplatePromptUpdateGroupColor'
import removeAgendaItem from './mutations/removeAgendaItem'
import removeAtlassianAuth from './mutations/removeAtlassianAuth'
import removeGitHubAuth from './mutations/removeGitHubAuth'
import removeOrgUser from './mutations/removeOrgUser'
import removeReflection from './mutations/removeReflection'
import removeReflectTemplate from './mutations/removeReflectTemplate'
import removeReflectTemplatePrompt from './mutations/removeReflectTemplatePrompt'
import removeSlackAuth from './mutations/removeSlackAuth'
import removeTeamMember from './mutations/removeTeamMember'
import renameMeeting from './mutations/renameMeeting'
import renameReflectTemplate from './mutations/renameReflectTemplate'
import renameReflectTemplatePrompt from './mutations/renameReflectTemplatePrompt'
import resetPassword from './mutations/resetPassword'
import segmentEventTrack from './mutations/segmentEventTrack'
import selectRetroTemplate from './mutations/selectRetroTemplate'
import setAppLocation from './mutations/setAppLocation'
import setCheckInEnabled from './mutations/setCheckInEnabled'
import setNotificationStatus from './mutations/setNotificationStatus'
import setOrgUserRole from './mutations/setOrgUserRole'
import setPhaseFocus from './mutations/setPhaseFocus'
import setSlackNotification from './mutations/setSlackNotification'
import setStageTimer from './mutations/setStageTimer'
import signUpWithPassword from './mutations/signUpWithPassword'
import startDraggingReflection from './mutations/startDraggingReflection'
import startNewMeeting from './mutations/startNewMeeting'
import toggleAgendaList from './mutations/toggleAgendaList'
import updateAgendaItem from './mutations/updateAgendaItem'
import updateCommentContent from './mutations/updateCommentContent'
import updateCreditCard from './mutations/updateCreditCard'
import updateDragLocation from './mutations/updateDragLocation'
import updateNewCheckInQuestion from './mutations/updateNewCheckInQuestion'
import updateOrg from './mutations/updateOrg'
import updateReflectionContent from './mutations/updateReflectionContent'
import updateReflectionGroupTitle from './mutations/updateReflectionGroupTitle'
import updateRetroMaxVotes from './mutations/updateRetroMaxVotes'
import updateTask from './mutations/updateTask'
import updateTaskDueDate from './mutations/updateTaskDueDate'
import updateTeamName from './mutations/updateTeamName'
import updateTemplateScope from './mutations/updateTemplateScope'
import updateUserProfile from './mutations/updateUserProfile'
import upgradeToPro from './mutations/upgradeToPro'
import verifyEmail from './mutations/verifyEmail'
import voteForReflectionGroup from './mutations/voteForReflectionGroup'

interface Context extends InternalContext, GQLContext {}

export default new GraphQLObjectType<any, Context, any>({
  name: 'Mutation',
  fields: () => ({
    acceptTeamInvitation,
    addAgendaItem,
    addAtlassianAuth,
    addComment,
    addReactjiToReflection, // DEPRECATED, delete after 4.25.0
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
    createJiraIssue,
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
    emailPasswordReset,
    endDraggingReflection,
    editReflection,
    editTask,
    endNewMeeting,
    flagReadyToAdvance,
    inactivateUser,
    invalidateSessions,
    inviteToTeam,
    loginWithGoogle,
    loginWithPassword,
    moveReflectTemplatePrompt,
    moveTeamToOrg,
    navigateMeeting,
    newMeetingCheckIn,
    payLater,
    pushInvitation,
    promoteNewMeetingFacilitator,
    promoteToTeamLead,
    reflectTemplatePromptUpdateDescription,
    reflectTemplatePromptUpdateGroupColor,
    removeAgendaItem,
    removeAtlassianAuth,
    removeGitHubAuth,
    removeOrgUser,
    removeReflectTemplate,
    removeReflectTemplatePrompt,
    renameMeeting,
    renameReflectTemplate,
    renameReflectTemplatePrompt,
    removeReflection,
    removeSlackAuth,
    removeTeamMember,
    resetPassword,
    segmentEventTrack,
    selectRetroTemplate,
    setAppLocation,
    setCheckInEnabled,
    setOrgUserRole,
    setPhaseFocus,
    setStageTimer,
    setSlackNotification,
    signUpWithPassword,
    startDraggingReflection,
    startNewMeeting,
    toggleAgendaList,
    updateAgendaItem,
    updateCommentContent,
    updateCreditCard,
    updateOrg,
    updateNewCheckInQuestion,
    updateDragLocation,
    updateReflectionContent,
    updateReflectionGroupTitle,
    updateRetroMaxVotes,
    updateTask,
    updateTaskDueDate,
    updateTeamName,
    updateTemplateScope,
    updateUserProfile,
    verifyEmail,
    voteForReflectionGroup,
    upgradeToPro
  })
})
