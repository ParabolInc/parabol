import {GraphQLBoolean} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {getUserId} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {TEAM_MEMBER_UPDATED} from 'universal/utils/constants';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';

export default {
  name: 'DisconnectSocket',
  description: 'a server-side mutation called when a client disconnects',
  type: GraphQLBoolean,
  resolve: async (source, args, {authToken, dataLoader, socketId}) => {
    // Note: no server secret means a client could call this themselves & appear disconnected when they aren't!
    const r = getRethink();

    // AUTH
    if (!socketId) return false;
    const userId = getUserId(authToken);

    // RESOLUTION
    const disconnectedUser = await r.table('User').get(userId)
      .update((user) => ({
        connectedSockets: user('connectedSockets').difference([socketId])
      }), {returnChanges: true})('changes')(0)('new_val').default(null);
    if (!disconnectedUser) return false;
    if (disconnectedUser.connectedSockets.length === 0) {
      // If that was the last socket, tell everyone they went offline
      const operationId = dataLoader.share();
      const {tms} = disconnectedUser;
      const teamMemberIds = tms.map((teamId) => toTeamMemberId(teamId, userId));
      const teamMembers = await dataLoader.get('teamMembers').loadMany(teamMemberIds);
      teamMembers.forEach((teamMember) => {
        const teamMemberUpdated = {
          ...teamMember,
          isConnected: false
        };
        getPubSub().publish(`${TEAM_MEMBER_UPDATED}.${teamMember.teamId}`, {teamMemberUpdated, operationId});
      });
    }
    return true;
  }
};
