import {GraphQLInt} from 'graphql';
import adjustUserCount from 'server/billing/helpers/adjustUserCount';
import getRethink from 'server/database/rethinkDriver';
import {requireSU} from 'server/utils/authorization';
import {AUTO_PAUSE_THRESH, AUTO_PAUSE_USER} from 'server/utils/serverConstants';

const autopauseUsers = {
  type: GraphQLInt,
  description: 'automatically pause users that have been inactive for 30 days. returns the number of users paused',
  resolve: async (source, args, {authToken}) => {
    const r = getRethink();

    // AUTH
    requireSU(authToken);

    // RESOLUTION
    const activeThresh = new Date(Date.now() - AUTO_PAUSE_THRESH);
    const users = await r.table('User')
      .filter((user) => user('lastSeenAt').le(activeThresh))
      .filter({
        inactive: false
      })
      .pluck('id', 'userOrgs');
    const userIds = users.map(({id}) => id);
    const updates = userIds.map((userId) => {
      return r.table('Organization')
        .getAll(userId, {index: 'orgUsers'})
        .update((org) => ({
          orgUsers: org('orgUsers').map((orgUser) => {
            return r.branch(
              orgUser('id').eq(userId),
              orgUser.merge({
                inactive: true
              }),
              orgUser
            );
          })
        }))
        .do(() => {
          return r.table('User')
            .get(userId)
            .update({
              inactive: true
            });
        })
        .run();
    });
    await Promise.all(updates);
    const adjustmentPromises = users.map((user) => {
      const orgIds = user.userOrgs.map(({id}) => id);
      try {
        return adjustUserCount(user.id, orgIds, AUTO_PAUSE_USER);
      } catch (e) {
        console.warn(`Error adjusting user count: ${e}`);
      }
      return undefined;
    });

    await Promise.all(adjustmentPromises);
    return adjustmentPromises.length;
  }
};

export default autopauseUsers;
