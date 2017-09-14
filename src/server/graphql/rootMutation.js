import {GraphQLObjectType} from 'graphql';
import agenda from 'server/graphql/models/AgendaItem/agendaItemMutation';
import meeting from 'server/graphql/models/Meeting/meetingMutation';
import organization from 'server/graphql/models/Organization/organizationMutation';
import orgApproval from 'server/graphql/models/OrgApproval/orgApprovalMutation';
import presence from 'server/graphql/models/Presence/presenceMutation';
import project from 'server/graphql/models/Project/projectMutation';
import team from 'server/graphql/models/Team/teamMutation';
import teamMember from 'server/graphql/models/TeamMember/teamMemberMutation';
import user from 'server/graphql/models/User/userMutation';
import addGitHubRepo from 'server/graphql/mutations/addGitHubRepo';
import addProvider from 'server/graphql/mutations/addProvider';
import addSlackChannel from 'server/graphql/mutations/addSlackChannel';
import clearNotification from 'server/graphql/mutations/clearNotification';
import createGitHubIssue from 'server/graphql/mutations/createGitHubIssue';
import githubAddAssignee from 'server/graphql/mutations/githubAddAssignee';
import githubAddMember from 'server/graphql/mutations/githubAddMember';
import githubRemoveMember from 'server/graphql/mutations/githubRemoveMember';
import inviteTeamMembers from 'server/graphql/mutations/inviteTeamMembers';
import joinIntegration from 'server/graphql/mutations/joinIntegration';
import leaveIntegration from 'server/graphql/mutations/leaveIntegration';
import promoteFacilitator from 'server/graphql/mutations/promoteFacilitator';
import removeGitHubRepo from 'server/graphql/mutations/removeGitHubRepo';
import removeProvider from 'server/graphql/mutations/removeProvider';
import removeSlackChannel from 'server/graphql/mutations/removeSlackChannel';
import requestFacilitator from 'server/graphql/mutations/requestFacilitator';
import segmentEventTrack from 'server/graphql/mutations/segmentEventTrack';
import approveToOrg from 'server/graphql/mutations/approveToOrg';
import acceptTeamInviteNotification from 'server/graphql/mutations/acceptTeamInviteNotification';
import acceptTeamInviteEmail from 'server/graphql/mutations/acceptTeamInviteEmail';
import resendTeamInvite from 'server/graphql/mutations/resendTeamInvite';
import cancelTeamInvite from 'server/graphql/mutations/cancelTeamInvite';

const rootFields = Object.assign({},
  agenda,
  meeting,
  orgApproval,
  organization,
  presence,
  project,
  team,
  teamMember,
  user
);

export default new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    ...rootFields,
    acceptTeamInviteEmail,
    acceptTeamInviteNotification,
    addGitHubRepo,
    addProvider,
    addSlackChannel,
    approveToOrg,
    cancelTeamInvite,
    clearNotification,
    createGitHubIssue,
    githubAddAssignee,
    githubAddMember,
    githubRemoveMember,
    inviteTeamMembers,
    joinIntegration,
    leaveIntegration,
    promoteFacilitator,
    removeProvider,
    removeSlackChannel,
    removeGitHubRepo,
    requestFacilitator,
    resendTeamInvite,
    segmentEventTrack
  })
});
