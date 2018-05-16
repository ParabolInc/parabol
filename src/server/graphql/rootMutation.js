import {GraphQLObjectType} from 'graphql'
import acceptTeamInvite from 'server/graphql/mutations/acceptTeamInvite'
import addAgendaItem from 'server/graphql/mutations/addAgendaItem'
import addGitHubRepo from 'server/graphql/mutations/addGitHubRepo'
import addOrg from 'server/graphql/mutations/addOrg'
import addProvider from 'server/graphql/mutations/addProvider'
import addSlackChannel from 'server/graphql/mutations/addSlackChannel'
import approveToOrg from 'server/graphql/mutations/approveToOrg'
import archiveTeam from 'server/graphql/mutations/archiveTeam'
import cancelApproval from 'server/graphql/mutations/cancelApproval'
import cancelTeamInvite from 'server/graphql/mutations/cancelTeamInvite'
import clearNotification from 'server/graphql/mutations/clearNotification'
import changeTaskTeam from 'server/graphql/mutations/changeTaskTeam'
import connectSocket from 'server/graphql/mutations/connectSocket'
import createGitHubIssue from 'server/graphql/mutations/createGitHubIssue'
import createTask from 'server/graphql/mutations/createTask'
import deleteTask from 'server/graphql/mutations/deleteTask'
import disconnectSocket from 'server/graphql/mutations/disconnectSocket'
import editTask from 'server/graphql/mutations/editTask'
import endMeeting from 'server/graphql/mutations/endMeeting'
import githubAddAssignee from 'server/graphql/mutations/githubAddAssignee'
import githubAddMember from 'server/graphql/mutations/githubAddMember'
import githubRemoveMember from 'server/graphql/mutations/githubRemoveMember'
import inactivateUser from 'server/graphql/mutations/inactivateUser'
import inviteTeamMembers from 'server/graphql/mutations/inviteTeamMembers'
import joinIntegration from 'server/graphql/mutations/joinIntegration'
import killMeeting from 'server/graphql/mutations/killMeeting'
import leaveIntegration from 'server/graphql/mutations/leaveIntegration'
import meetingCheckIn from 'server/graphql/mutations/meetingCheckIn'
import moveMeeting from 'server/graphql/mutations/moveMeeting'
import navigateMeeting from 'server/graphql/mutations/navigateMeeting'
import promoteFacilitator from 'server/graphql/mutations/promoteFacilitator'
import promoteNewMeetingFacilitator from 'server/graphql/mutations/promoteNewMeetingFacilitator'
import promoteToTeamLead from 'server/graphql/mutations/promoteToTeamLead'
import rejectOrgApproval from 'server/graphql/mutations/rejectOrgApproval'
import removeAgendaItem from 'server/graphql/mutations/removeAgendaItem'
import removeGitHubRepo from 'server/graphql/mutations/removeGitHubRepo'
import removeProvider from 'server/graphql/mutations/removeProvider'
import removeSlackChannel from 'server/graphql/mutations/removeSlackChannel'
import removeTeamMember from 'server/graphql/mutations/removeTeamMember'
import requestFacilitator from 'server/graphql/mutations/requestFacilitator'
import resendTeamInvite from 'server/graphql/mutations/resendTeamInvite'
import segmentEventTrack from 'server/graphql/mutations/segmentEventTrack'
import setOrgUserRole from 'server/graphql/mutations/setOrgUserRole'
import startMeeting from 'server/graphql/mutations/startMeeting'
import startNewMeeting from 'server/graphql/mutations/startNewMeeting'
import stripeCreateInvoice from 'server/graphql/mutations/stripeCreateInvoice'
import stripeFailPayment from 'server/graphql/mutations/stripeFailPayment'
import stripeSucceedPayment from 'server/graphql/mutations/stripeSucceedPayment'
import stripeUpdateCreditCard from 'server/graphql/mutations/stripeUpdateCreditCard'
import stripeUpdateInvoiceItem from 'server/graphql/mutations/stripeUpdateInvoiceItem'
import toggleAgendaList from 'server/graphql/mutations/toggleAgendaList'
import updateAgendaItem from 'server/graphql/mutations/updateAgendaItem'
import updateCreditCard from 'server/graphql/mutations/updateCreditCard'
import updateOrg from 'server/graphql/mutations/updateOrg'
import updateTask from 'server/graphql/mutations/updateTask'
import updateCheckInQuestion from 'server/graphql/mutations/updateTeamCheckInQuestion'
import updateNewCheckInQuestion from 'server/graphql/mutations/updateNewCheckInQuestion'
import upgradeToPro from 'server/graphql/mutations/upgradeToPro'
import moveTeamToOrg from 'server/graphql/mutations/moveTeamToOrg'
import addTeam from 'server/graphql/mutations/addTeam'
import updateTeamName from 'server/graphql/mutations/updateTeamName'
import createFirstTeam from 'server/graphql/mutations/createFirstTeam'
import removeOrgUser from 'server/graphql/mutations/removeOrgUser'
import createOrgPicturePutUrl from 'server/graphql/mutations/createOrgPicturePutUrl'
import addFeatureFlag from 'server/graphql/mutations/addFeatureFlag'
import createImposterToken from 'server/graphql/mutations/createImposterToken'
import createUserPicturePutUrl from 'server/graphql/mutations/createUserPicturePutUrl'
import login from 'server/graphql/mutations/login'
import updateUserProfile from 'server/graphql/mutations/updateUserProfile'
import endNewMeeting from 'server/graphql/mutations/endNewMeeting'
import createReflection from 'server/graphql/mutations/createReflection'
import updateReflectionContent from 'server/graphql/mutations/updateReflectionContent'
import editReflection from 'server/graphql/mutations/editReflection'
import updateReflectionLocation from 'server/graphql/mutations/updateReflectionLocation'
import removeReflection from 'server/graphql/mutations/removeReflection'
import createReflectionGroup from 'server/graphql/mutations/createReflectionGroup'
import updateReflectionGroupTitle from 'server/graphql/mutations/updateReflectionGroupTitle'
import voteForReflectionGroup from 'server/graphql/mutations/voteForReflectionGroup'
import newMeetingCheckIn from 'server/graphql/mutations/newMeetingCheckIn'
import autoGroupReflections from 'server/graphql/mutations/autoGroupReflections'
import dragReflection from 'server/graphql/mutations/dragReflection'
import updateTaskDueDate from 'server/graphql/mutations/updateTaskDueDate'

export default new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    acceptTeamInvite,
    addAgendaItem,
    addFeatureFlag,
    addGitHubRepo,
    addOrg,
    addProvider,
    addSlackChannel,
    addTeam,
    approveToOrg,
    archiveTeam,
    autoGroupReflections,
    cancelApproval,
    cancelTeamInvite,
    changeTaskTeam,
    clearNotification,
    connectSocket,
    createImposterToken,
    createFirstTeam,
    createGitHubIssue,
    createOrgPicturePutUrl,
    createReflection,
    createReflectionGroup,
    createTask,
    createUserPicturePutUrl,
    deleteTask,
    disconnectSocket,
    dragReflection,
    editReflection,
    editTask,
    endMeeting,
    githubAddAssignee,
    githubAddMember,
    githubRemoveMember,
    inactivateUser,
    inviteTeamMembers,
    joinIntegration,
    killMeeting,
    endNewMeeting,
    leaveIntegration,
    meetingCheckIn,
    moveMeeting,
    moveTeamToOrg,
    navigateMeeting,
    newMeetingCheckIn,
    promoteFacilitator,
    promoteNewMeetingFacilitator,
    promoteToTeamLead,
    rejectOrgApproval,
    removeAgendaItem,
    removeProvider,
    removeSlackChannel,
    removeGitHubRepo,
    removeOrgUser,
    removeReflection,
    removeTeamMember,
    requestFacilitator,
    resendTeamInvite,
    segmentEventTrack,
    setOrgUserRole,
    startMeeting,
    startNewMeeting,
    stripeCreateInvoice,
    stripeFailPayment,
    stripeSucceedPayment,
    stripeUpdateCreditCard,
    stripeUpdateInvoiceItem,
    toggleAgendaList,
    updateAgendaItem,
    updateCreditCard,
    updateOrg,
    updateCheckInQuestion,
    updateNewCheckInQuestion,
    updateReflectionContent,
    updateReflectionGroupTitle,
    updateReflectionLocation,
    updateTask,
    updateTaskDueDate,
    updateTeamName,
    updateUserProfile,
    voteForReflectionGroup,
    login,
    upgradeToPro
  })
})
