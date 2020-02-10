import {GraphQLObjectType} from 'graphql'
import addAgendaItem from './mutations/addAgendaItem'
import addOrg from './mutations/addOrg'
import archiveTeam from './mutations/archiveTeam'
import setNotificationStatus from './mutations/setNotificationStatus'
import changeTaskTeam from './mutations/changeTaskTeam'
import createGitHubIssue from './mutations/createGitHubIssue'
import createTask from './mutations/createTask'
import deleteTask from './mutations/deleteTask'
import downgradeToPersonal from './mutations/downgradeToPersonal'
import editTask from './mutations/editTask'
import inactivateUser from './mutations/inactivateUser'
import navigateMeeting from './mutations/navigateMeeting'
import promoteNewMeetingFacilitator from './mutations/promoteNewMeetingFacilitator'
import promoteToTeamLead from './mutations/promoteToTeamLead'
import removeAgendaItem from './mutations/removeAgendaItem'
import removeTeamMember from './mutations/removeTeamMember'
import segmentEventTrack from './mutations/segmentEventTrack'
import setOrgUserRole from './mutations/setOrgUserRole'
import startNewMeeting from './mutations/startNewMeeting'
import toggleAgendaList from './mutations/toggleAgendaList'
import updateAgendaItem from './mutations/updateAgendaItem'
import updateCreditCard from './mutations/updateCreditCard'
import updateOrg from './mutations/updateOrg'
import updateTask from './mutations/updateTask'
import updateDragLocation from './mutations/updateDragLocation'
import updateNewCheckInQuestion from './mutations/updateNewCheckInQuestion'
import upgradeToPro from './mutations/upgradeToPro'
import moveTeamToOrg from './mutations/moveTeamToOrg'
import addTeam from './mutations/addTeam'
import updateTeamName from './mutations/updateTeamName'
import removeOrgUser from './mutations/removeOrgUser'
import createOrgPicturePutUrl from './mutations/createOrgPicturePutUrl'
import addFeatureFlag from './mutations/addFeatureFlag'
import createImposterToken from './mutations/createImposterToken'
import createUserPicturePutUrl from './mutations/createUserPicturePutUrl'
import updateUserProfile from './mutations/updateUserProfile'
import endNewMeeting from './mutations/endNewMeeting'
import createReflection from './mutations/createReflection'
import updateReflectionContent from './mutations/updateReflectionContent'
import editReflection from './mutations/editReflection'
import removeReflection from './mutations/removeReflection'
import updateReflectionGroupTitle from './mutations/updateReflectionGroupTitle'
import voteForReflectionGroup from './mutations/voteForReflectionGroup'
import newMeetingCheckIn from './mutations/newMeetingCheckIn'
import autoGroupReflections from './mutations/autoGroupReflections'
import endDraggingReflection from './mutations/endDraggingReflection'
import updateTaskDueDate from './mutations/updateTaskDueDate'
import dragDiscussionTopic from './mutations/dragDiscussionTopic'
import startDraggingReflection from './mutations/startDraggingReflection'
import setPhaseFocus from './mutations/setPhaseFocus'
import selectRetroTemplate from './mutations/selectRetroTemplate'
import addReflectTemplate from './mutations/addReflectTemplate'
import addReflectTemplatePrompt from './mutations/addReflectTemplatePrompt'
import moveReflectTemplatePrompt from './mutations/moveReflectTemplatePrompt'
import removeReflectTemplate from './mutations/removeReflectTemplate'
import removeReflectTemplatePrompt from './mutations/removeReflectTemplatePrompt'
import renameReflectTemplate from './mutations/renameReflectTemplate'
import renameReflectTemplatePrompt from './mutations/renameReflectTemplatePrompt'
import inviteToTeam from './mutations/inviteToTeam'
import acceptTeamInvitation from './mutations/acceptTeamInvitation'
import dismissSuggestedAction from './mutations/dismissSuggestedAction'
import dismissNewFeature from './mutations/dismissNewFeature'
import addAtlassianAuth from './mutations/addAtlassianAuth'
import removeAtlassianAuth from './mutations/removeAtlassianAuth'
import createJiraIssue from './mutations/createJiraIssue'
import reflectTemplatePromptUpdateDescription from './mutations/reflectTemplatePromptUpdateDescription'
import addGitHubAuth from './mutations/addGitHubAuth'
import removeGitHubAuth from './mutations/removeGitHubAuth'
import removeSlackAuth from './mutations/removeSlackAuth'
import {GQLContext, InternalContext} from './graphql'
import addSlackAuth from './mutations/addSlackAuth'
import setSlackNotification from './mutations/setSlackNotification'
import setStageTimer from './mutations/setStageTimer'
import pushInvitation from './mutations/pushInvitation'
import denyPushInvitation from './mutations/denyPushInvitation'
import payLater from './mutations/payLater'
import setCheckInEnabled from './mutations/setCheckInEnabled'
import signUpWithPassword from './mutations/signUpWithPassword'
import loginWithGoogle from './mutations/loginWithGoogle'
import loginWithPassword from './mutations/loginWithPassword'
import emailPasswordReset from './mutations/emailPasswordReset'
import resetPassword from './mutations/resetPassword'
import invalidateSessions from './mutations/invalidateSessions'
import createMassInvitation from './mutations/createMassInvitation'
import renameMeeting from './mutations/renameMeeting'
import addReactjiToReflection from './mutations/addReactjiToReflection'
import setAppLocation from './mutations/setAppLocation'
import deleteUser from './mutations/deleteUser'
import verifyEmail from './mutations/verifyEmail'

interface Context extends InternalContext, GQLContext {}

export default new GraphQLObjectType<any, Context, any>({
  name: 'Mutation',
  fields: () => ({
    acceptTeamInvitation,
    addAgendaItem,
    addAtlassianAuth,
    addReactjiToReflection,
    addReflectTemplate,
    addReflectTemplatePrompt,
    addSlackAuth,
    addFeatureFlag,
    addGitHubAuth,
    addOrg,
    addTeam,
    archiveTeam,
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
    updateCreditCard,
    updateOrg,
    updateNewCheckInQuestion,
    updateDragLocation,
    updateReflectionContent,
    updateReflectionGroupTitle,
    updateTask,
    updateTaskDueDate,
    updateTeamName,
    updateUserProfile,
    verifyEmail,
    voteForReflectionGroup,
    upgradeToPro
  })
})
