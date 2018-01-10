import {GraphQLObjectType} from 'graphql';
import {resolveInvitation} from 'server/graphql/resolvers';
import Invitation from 'server/graphql/types/Invitation';
import NotifyTeamInvite from 'server/graphql/types/NotifyTeamInvite';
import {getUserId} from 'server/utils/authorization';

const CancelTeamInvitePayload = new GraphQLObjectType({
  name: 'CancelTeamInvitePayload',
  fields: () => ({
    invitation: {
      type: Invitation,
      description: 'The cancelled invitation',
      resolve: resolveInvitation
    },
    removedTeamInviteNotification: {
      type: NotifyTeamInvite,
      resolve: ({removedTeamInviteNotification}, args, {authToken}) => {
        if (!removedTeamInviteNotification) return null;
        const viewerId = getUserId(authToken);
        const notificationUserId = removedTeamInviteNotification.userIds[0];
        return notificationUserId === viewerId ? removedTeamInviteNotification : null;
      }
    }
  })
});

export default CancelTeamInvitePayload;
