import adjustUserCount from 'server/billing/helpers/adjustUserCount';
import getRethink from 'server/database/rethinkDriver';
import sendAppVersion from 'server/graphql/mutations/helpers/sendAppVersion';
import User from 'server/graphql/types/User';
import {getUserId} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {UNPAUSE_USER} from 'server/utils/serverConstants';
import {TEAM_MEMBER, UPDATED} from 'universal/utils/constants';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';


export default {
  name: 'ConnectSocket',
  description: 'a server-side mutation called when a client connects',
  type: User,
  resolve: async (source, args, {authToken, dataLoader, socketId}) => {
    const r = getRethink();
    const now = new Date();

    // AUTH
    if (!socketId) {
      throw new Error('Called connect without a valid socket');
    }
    const userId = getUserId(authToken);

    // RESOLUTION
    const userChanges = await r.table('User').get(userId)
      .update((user) => ({
        inactive: false,
        updatedAt: now,
        lastSeenAt: now,
        connectedSockets: user('connectedSockets').default([]).append(socketId)
      }), {returnChanges: true})('changes')(0).default({});

    const {old_val: oldUser, new_val: user} = userChanges;
    const {inactive, userOrgs} = oldUser;
    const {connectedSockets, tms} = user;

    // no need to wait for this, it's just for billing
    if (inactive) {
      const orgIds = userOrgs.map(({id}) => id);
      adjustUserCount(userId, orgIds, UNPAUSE_USER);
    }

    if (connectedSockets.length === 1) {
      // Tell everyone this user is now online
      const operationId = dataLoader.share();
      const teamMemberIds = tms.map((teamId) => toTeamMemberId(teamId, userId));
      const teamMembers = await dataLoader.get('teamMembers').loadMany(teamMemberIds);
      const subOptions = {mutatorId: socketId, operationId};
      teamMembers.forEach((teamMember) => {
        const {id: teamMemberId, teamId} = teamMember;
        publish(TEAM_MEMBER, teamId, UPDATED, {teamMemberId, isConnected: true}, subOptions);
      });
    }
    sendAppVersion(userId);
    return user;
  }
};
