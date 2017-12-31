import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import AcceptTeamInvitePayload from 'server/graphql/types/AcceptTeamInvitePayload';
import acceptTeamInvite from 'server/safeMutations/acceptTeamInvite';
import {getUserId, requireNotificationOwner} from 'server/utils/authorization';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';

export default {
  type: new GraphQLNonNull(AcceptTeamInvitePayload),
  description: 'Approve an outsider to join the organization',
  args: {
    notificationId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The notification id of the team invite'
    }
  },
  async resolve(source, {notificationId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const operationId = dataLoader.share();

    // AUTH
    const viewerId = getUserId(authToken);
    const notification = await r.table('Notification').get(notificationId);
    requireNotificationOwner(viewerId, notification);

    // RESOLUTION
    const {inviteeEmail, teamId} = notification;
    const {removedNotification, newAuthToken} = acceptTeamInvite(teamId, authToken, inviteeEmail, {operationId, mutatorId});
    return {
      teamId,
      teamMemberId: toTeamMemberId(teamId, viewerId),
      removedNotification,
      authToken: newAuthToken
    };
  }
};

