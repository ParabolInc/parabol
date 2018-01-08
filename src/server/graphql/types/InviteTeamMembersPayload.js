import {GraphQLList, GraphQLObjectType} from 'graphql';
import {makeResolveNotificationForViewer, resolveTeam} from 'server/graphql/resolvers';
import Invitation from 'server/graphql/types/Invitation';
import NotifyAddedToTeam from 'server/graphql/types/NotifyAddedToTeam';
import NotifyRequestNewUser from 'server/graphql/types/NotifyRequestNewUser';
import NotifyTeamInvite from 'server/graphql/types/NotifyTeamInvite';
import OrgApproval from 'server/graphql/types/OrgApproval';
import Team from 'server/graphql/types/Team';
import TeamMember from 'server/graphql/types/TeamMember';


const InviteTeamMembersPayload = new GraphQLObjectType({
  name: 'InviteTeamMembersPayload',
  description: 'A list of all the possible outcomes when trying to invite a team member',
  fields: () => ({
    team: {
      type: Team,
      description: 'The team the inviter is inviting the invitee to',
      resolve: resolveTeam
    },
    // invitee fields
    reactivationNotification: {
      type: NotifyAddedToTeam,
      description: 'The notification sent to the invitee if they were previously on the team',
      resolve: makeResolveNotificationForViewer('reactivationNotificationIds', '')
    },
    teamInviteNotification: {
      type: NotifyTeamInvite,
      description: 'The notification sent to the invitee',
      resolve: makeResolveNotificationForViewer('inviteNotificationIds', 'inviteNotifications')
    },
    // org leader fields
    removedRequestNotification: {
      type: NotifyRequestNewUser,
      description: 'A removed request notification if the org leader invited the invitee instead of approving',
      resolve: makeResolveNotificationForViewer('-', 'removedRequestNotifications')
    },
    requestNotification: {
      type: NotifyRequestNewUser,
      description: 'The notification sent to the org billing leader requesting to be approved',
      resolve: makeResolveNotificationForViewer('-', 'requestNotifications')
    },
    // annoucement fields
    reactivatedTeamMembers: {
      type: new GraphQLList(TeamMember),
      description: 'The list of emails that turned out to be reactivated team members',
      resolve: ({reactivatedTeamMemberIds}, args, {dataLoader}) => {
        if (!reactivatedTeamMemberIds || reactivatedTeamMemberIds.length === 0) return null;
        return dataLoader.get('teamMembers').loadMany(reactivatedTeamMemberIds);
      }
    },
    invitationsSent: {
      type: new GraphQLList(Invitation),
      description: 'The list of invitations successfully sent out',
      resolve: ({invitationIds}, args, {dataLoader}) => {
        if (!invitationIds || invitationIds.length === 0) return null;
        return dataLoader.get('invitations').loadMany(invitationIds);
      }
    },
    orgApprovalsSent: {
      type: new GraphQLList(OrgApproval),
      description: 'The list of orgApprovals sent to the org leader',
      resolve: ({orgApprovalIds}, args, {dataLoader}) => {
        if (!orgApprovalIds || orgApprovalIds.length === 0) return null;
        return dataLoader.get('orgApprovals').loadMany(orgApprovalIds);
      }
    },
    orgApprovalsRemoved: {
      type: new GraphQLList(OrgApproval),
      description: 'The list of orgApprovals removed. Triggered if An org leader invites someone with a pending approval',
      resolve: ({removedOrgApprovalIds}, args, {dataLoader}) => {
        if (!removedOrgApprovalIds || removedOrgApprovalIds.length === 0) return null;
        return dataLoader.get('orgApprovals').loadMany(removedOrgApprovalIds);
      }
    }
  })
});

export default InviteTeamMembersPayload;
