import {GraphQLObjectType} from 'graphql';
import organization from 'server/graphql/models/Organization/organizationMutation';
import team from 'server/graphql/models/Team/teamMutation';
import user from 'server/graphql/models/User/userMutation';
import acceptTeamInviteEmail from 'server/graphql/mutations/acceptTeamInviteEmail';
import acceptTeamInviteNotification from 'server/graphql/mutations/acceptTeamInviteNotification';
import addAgendaItem from 'server/graphql/mutations/addAgendaItem';
import addGitHubRepo from 'server/graphql/mutations/addGitHubRepo';
import addOrg from 'server/graphql/mutations/addOrg';
import addProvider from 'server/graphql/mutations/addProvider';
import addSlackChannel from 'server/graphql/mutations/addSlackChannel';
import approveToOrg from 'server/graphql/mutations/approveToOrg';
import archiveTeam from 'server/graphql/mutations/archiveTeam';
import cancelApproval from 'server/graphql/mutations/cancelApproval';
import cancelTeamInvite from 'server/graphql/mutations/cancelTeamInvite';
import clearNotification from 'server/graphql/mutations/clearNotification';
import connectSocket from 'server/graphql/mutations/connectSocket';
import createGitHubIssue from 'server/graphql/mutations/createGitHubIssue';
import createProject from 'server/graphql/mutations/createProject';
import deleteProject from 'server/graphql/mutations/deleteProject';
import disconnectSocket from 'server/graphql/mutations/disconnectSocket';
import editProject from 'server/graphql/mutations/editProject';
import endMeeting from 'server/graphql/mutations/endMeeting';
import githubAddAssignee from 'server/graphql/mutations/githubAddAssignee';
import githubAddMember from 'server/graphql/mutations/githubAddMember';
import githubRemoveMember from 'server/graphql/mutations/githubRemoveMember';
import inactivateUser from 'server/graphql/mutations/inactivateUser';
import inviteTeamMembers from 'server/graphql/mutations/inviteTeamMembers';
import joinIntegration from 'server/graphql/mutations/joinIntegration';
import killMeeting from 'server/graphql/mutations/killMeeting';
import leaveIntegration from 'server/graphql/mutations/leaveIntegration';
import meetingCheckIn from 'server/graphql/mutations/meetingCheckIn';
import moveMeeting from 'server/graphql/mutations/moveMeeting';
import promoteFacilitator from 'server/graphql/mutations/promoteFacilitator';
import promoteToTeamLead from 'server/graphql/mutations/promoteToTeamLead';
import rejectOrgApproval from 'server/graphql/mutations/rejectOrgApproval';
import removeAgendaItem from 'server/graphql/mutations/removeAgendaItem';
import removeGitHubRepo from 'server/graphql/mutations/removeGitHubRepo';
import removeProvider from 'server/graphql/mutations/removeProvider';
import removeSlackChannel from 'server/graphql/mutations/removeSlackChannel';
import removeTeamMember from 'server/graphql/mutations/removeTeamMember';
import requestFacilitator from 'server/graphql/mutations/requestFacilitator';
import resendTeamInvite from 'server/graphql/mutations/resendTeamInvite';
import segmentEventTrack from 'server/graphql/mutations/segmentEventTrack';
import setOrgUserRole from 'server/graphql/mutations/setOrgUserRole';
import startMeeting from 'server/graphql/mutations/startMeeting';
import stripeCreateInvoice from 'server/graphql/mutations/stripeCreateInvoice';
import stripeFailPayment from 'server/graphql/mutations/stripeFailPayment';
import stripeSucceedPayment from 'server/graphql/mutations/stripeSucceedPayment';
import stripeUpdateCreditCard from 'server/graphql/mutations/stripeUpdateCreditCard';
import stripeUpdateInvoiceItem from 'server/graphql/mutations/stripeUpdateInvoiceItem';
import toggleAgendaList from 'server/graphql/mutations/toggleAgendaList';
import updateAgendaItem from 'server/graphql/mutations/updateAgendaItem';
import updateCreditCard from 'server/graphql/mutations/updateCreditCard';
import updateOrg from 'server/graphql/mutations/updateOrg';
import updateProject from 'server/graphql/mutations/updateProject';
import updateCheckInQuestion from 'server/graphql/mutations/updateTeamCheckInQuestion';
import upgradeToPro from 'server/graphql/mutations/upgradeToPro';

const rootFields = Object.assign({},
  organization,
  team,
  user
);

export default new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    ...rootFields,
    acceptTeamInviteEmail,
    acceptTeamInviteNotification,
    addAgendaItem,
    addGitHubRepo,
    addOrg,
    addProvider,
    addSlackChannel,
    approveToOrg,
    archiveTeam,
    cancelApproval,
    cancelTeamInvite,
    clearNotification,
    connectSocket,
    createGitHubIssue,
    createProject,
    deleteProject,
    disconnectSocket,
    editProject,
    endMeeting,
    githubAddAssignee,
    githubAddMember,
    githubRemoveMember,
    inactivateUser,
    inviteTeamMembers,
    joinIntegration,
    killMeeting,
    leaveIntegration,
    meetingCheckIn,
    moveMeeting,
    promoteFacilitator,
    promoteToTeamLead,
    rejectOrgApproval,
    removeAgendaItem,
    removeProvider,
    removeSlackChannel,
    removeGitHubRepo,
    removeTeamMember,
    requestFacilitator,
    resendTeamInvite,
    segmentEventTrack,
    setOrgUserRole,
    startMeeting,
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
    updateProject,
    upgradeToPro
  })
});
