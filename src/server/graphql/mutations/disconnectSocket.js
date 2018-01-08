import getRethink from 'server/database/rethinkDriver';
import User from 'server/graphql/types/User';
import {getUserId} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {NOTIFICATION} from 'universal/utils/constants';

export default {
  name: 'DisconnectSocket',
  description: 'a server-side mutation called when a client disconnects',
  type: User,
  resolve: async (source, args, {authToken, dataLoader, socketId}) => {
    // Note: no server secret means a client could call this themselves & appear disconnected when they aren't!
    const r = getRethink();

    // AUTH
    if (!socketId) return false;
    const userId = getUserId(authToken);

    // RESOLUTION
    const disconnectedUser = await r.table('User').get(userId)
      .update((user) => ({
        connectedSockets: user('connectedSockets').default([]).difference([socketId])
      }), {returnChanges: true})('changes')(0)('new_val').default(null);

    if (!disconnectedUser) return false;
    if (disconnectedUser.connectedSockets.length === 0) {
      // If that was the last socket, tell everyone they went offline
      const operationId = dataLoader.share();
      const subOptions = {mutatorId: socketId, operationId};
      const {tms} = disconnectedUser;
      const listeningUserIds = await r.table('TeamMember')
        .getAll(r.args(tms), {index: 'teamId'})
        .filter({isNotRemoved: true})('userId')
        .distinct();
      listeningUserIds.forEach((onlineUserId) => {
        publish(NOTIFICATION, onlineUserId, User, disconnectedUser, subOptions);
      });
    }
    return disconnectedUser;
  }
};
