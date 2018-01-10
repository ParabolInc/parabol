import {GraphQLList, GraphQLObjectType} from 'graphql';
import {makeResolveNotificationsForViewer, resolveInvitations} from 'server/graphql/resolvers';
import Invitation from 'server/graphql/types/Invitation';
import NotifyInviteeApproved from 'server/graphql/types/NotifyInviteeApproved';
import NotifyRequestNewUser from 'server/graphql/types/NotifyRequestNewUser';
import NotifyTeamInvite from 'server/graphql/types/NotifyTeamInvite';
import OrgApproval from 'server/graphql/types/OrgApproval';

const ApproveToOrgPayload = new GraphQLObjectType({
  name: 'ApproveToOrgPayload',
  fields: () => ({
    removedRequestNotifications: {
      type: new GraphQLList(NotifyRequestNewUser),
      description: 'If the viewer is an org leader, the notifications removed after approving to the organization',
      resolve: makeResolveNotificationsForViewer('-', 'removedRequestNotifications')
    },
    removedOrgApprovals: {
      type: new GraphQLList(OrgApproval),
      description: 'If the viegnwer is a team member, the org approvals that were removed in place of team members',
      resolve: ({removedOrgApprovals, teamIdFilter}) => {
        if (!teamIdFilter) return removedOrgApprovals;
        return removedOrgApprovals.filter((approval) => approval.teamId === teamIdFilter);
      }
    },
    newInvitations: {
      type: new GraphQLList(Invitation),
      description: 'If the viewer is a team member, the list of team members added as a result of the approval',
      resolve: async (source, args, context) => {
        const {teamIdFilter} = source;
        const invitations = await resolveInvitations(source, args, context);
        return teamIdFilter ? invitations.filter((invitation) => invitation.teamId === teamIdFilter) : invitations;
      }
    },
    inviteeApprovedNotifications: {
      type: new GraphQLList(NotifyInviteeApproved),
      description: 'If the viewer invited the invitee, the notifications to say they have been approved',
      resolve: makeResolveNotificationsForViewer('inviteeApprovedNotificationIds', '')
    },
    teamInviteNotifications: {
      type: new GraphQLList(NotifyTeamInvite),
      description: 'If the viewer is the invitee, the notifications to invite them to teams',
      resolve: makeResolveNotificationsForViewer('teamInviteNotificationIds', '')
    }
  })
});

export default ApproveToOrgPayload;
