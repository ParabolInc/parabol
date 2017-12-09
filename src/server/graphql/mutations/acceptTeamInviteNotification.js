import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import NotifyAddedToTeam from 'server/graphql/types/NotifyAddedToTeam';
import acceptTeamInvite from 'server/safeMutations/acceptTeamInvite';
import {getUserId, requireNotificationOwner} from 'server/utils/authorization';

export default {
  type: new GraphQLNonNull(NotifyAddedToTeam),
  description: 'Approve an outsider to join the organization',
  args: {
    notificationId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The notification id of the team invite'
    }
  },
  async resolve(source, {notificationId}, {authToken, dataLoader, socketId}) {
    const r = getRethink();
    const operationId = dataLoader.share();

    // AUTH
    const userId = getUserId(authToken);
    const notification = await r.table('Notification').get(notificationId);
    requireNotificationOwner(userId, notification);

    // RESOLUTION
    const {inviteeEmail, teamId} = notification;
    return acceptTeamInvite(teamId, authToken, inviteeEmail, {operationId, mutatorId: socketId});
  }
};

