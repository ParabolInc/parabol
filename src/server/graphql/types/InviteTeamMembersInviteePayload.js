import {GraphQLObjectType} from 'graphql';
import {makeResolveNotificationForViewer, resolveNotificationForViewer} from 'server/graphql/resolvers';
import InviteTeamMembersPayload, {inviteTeamMembersFields} from 'server/graphql/types/InviteTeamMembersPayload';
import NotifyAddedToTeam from 'server/graphql/types/NotifyAddedToTeam';
import NotifyTeamInvite from 'server/graphql/types/NotifyTeamInvite';

const InviteTeamMembersInviteePayload = new GraphQLObjectType({
  name: 'InviteTeamMembersInviteePayload',
  description: 'A list of all the possible outcomes when trying to invite a team member',
  interfaces: () => [InviteTeamMembersPayload],
  fields: () => ({
    ...inviteTeamMembersFields,
    reactivationNotification: {
      type: NotifyAddedToTeam,
      description: 'The notification sent to the invitee if they were previously on the team',
      resolve: resolveNotificationForViewer
    },
    teamInviteNotification: {
      type: NotifyTeamInvite,
      description: 'The notification sent to the invitee',
      resolve: makeResolveNotificationForViewer('inviteNotificationIds', 'inviteNotifications')
    }
  })
});

export default InviteTeamMembersInviteePayload;
