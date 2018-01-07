import {GraphQLObjectType} from 'graphql';
import {makeResolveNotificationForViewer} from 'server/graphql/resolvers';
import InviteTeamMembersPayload, {inviteTeamMembersFields} from 'server/graphql/types/InviteTeamMembersPayload';
import NotifyRequestNewUser from 'server/graphql/types/NotifyRequestNewUser';

const InviteTeamMembersOrgLeaderPayload = new GraphQLObjectType({
  name: 'InviteTeamMembersOrgLeaderPayload',
  description: 'A list of all the possible outcomes when trying to invite a team member',
  interfaces: () => [InviteTeamMembersPayload],
  fields: () => ({
    ...inviteTeamMembersFields,
    removedRequestNotification: {
      type: NotifyRequestNewUser,
      description: 'A removed request notification if the org leader invited the invitee instead of approving',
      resolve: makeResolveNotificationForViewer('-', 'removedRequestNotifications')
    },
    requestNotification: {
      type: NotifyRequestNewUser,
      description: 'The notification sent to the org billing leader requesting to be approved',
      resolve: makeResolveNotificationForViewer('-', 'requestNotifications')
    }
  })
});

export default InviteTeamMembersOrgLeaderPayload;
