import getRethink from 'server/database/rethinkDriver';
import {getUserId} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {NOTIFICATION} from 'universal/utils/constants';
import DisconnectSocketPayload from 'server/graphql/types/DisconnectSocketPayload';
import promoteFirstTeamMember from 'server/graphql/mutations/helpers/promoteFirstTeamMember';
import {MEETING_FACILITATOR_ELECTION_TIMEOUT, SHARED_DATA_LOADER_TTL} from 'server/utils/serverConstants';
import sendSegmentEvent from 'server/utils/sendSegmentEvent';

export default {
  name: 'DisconnectSocket',
  description: 'a server-side mutation called when a client disconnects',
  type: DisconnectSocketPayload,
  resolve: async (source, args, {authToken, dataLoader, socketId}) => {
    // Note: no server secret means a client could call this themselves & appear disconnected when they aren't!
    const r = getRethink();

    // AUTH
    if (!socketId) return undefined;
    const userId = getUserId(authToken);

    // RESOLUTION
    const disconnectedUser = await r.table('User').get(userId)
      .update((user) => ({
        connectedSockets: user('connectedSockets').default([]).difference([socketId])
      }), {returnChanges: true})('changes')(0)('new_val').default(null);

    if (!disconnectedUser) return undefined;
    const {connectedSockets, tms} = disconnectedUser;
    const data = {user: disconnectedUser};
    if (connectedSockets.length === 0) {
      // If that was the last socket, tell everyone they went offline
      const {listeningUserIds, facilitatingTeams} = await r({
        listeningUserIds: r.table('TeamMember')
          .getAll(r.args(tms), {index: 'teamId'})
          .filter({isNotRemoved: true})('userId')
          .distinct(),
        facilitatingTeams: r.table('Team')
          .getAll(r.args(tms))
          .eqJoin('meetingId', r.table('NewMeeting'))
          .zip()
          .filter((row) => row('facilitatorUserId').eq(userId))
          .pluck('teamId', 'meetingId')
          .coerceTo('array')
          .default([])
      });
      const customTTL = facilitatingTeams.length > 0 ? MEETING_FACILITATOR_ELECTION_TIMEOUT + SHARED_DATA_LOADER_TTL : undefined;
      const operationId = dataLoader.share(customTTL);
      const subOptions = {mutatorId: socketId, operationId};
      listeningUserIds.forEach((onlineUserId) => {
        publish(NOTIFICATION, onlineUserId, DisconnectSocketPayload, data, subOptions);
      });
      if (facilitatingTeams.length > 0) {
        setTimeout(async () => {
          const userOffline = await r.table('User')
            .get(userId)('connectedSockets')
            .count()
            .eq(0)
            .default(true);
          if (userOffline) {
            const teamMemberPromotion = promoteFirstTeamMember(userId, subOptions);
            facilitatingTeams.forEach(teamMemberPromotion);
          }
        }, MEETING_FACILITATOR_ELECTION_TIMEOUT);
      }
    }
    sendSegmentEvent('Disconnect WebSocket', userId, {connectedSockets, socketId, tms});
    return data;
  }
};
