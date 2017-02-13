import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLString,
  GraphQLInt,
} from 'graphql';
import {requireSU} from 'server/utils/authorization';
import {
  AUTO_PAUSE_THRESH,
  AUTO_PAUSE_THROTTLE,
  AUTO_PAUSE_USER
} from 'server/utils/serverConstants'
import adjustUserCount from 'server/billing/helpers/adjustUserCount';

export default {
  intranetPing: {
    type: GraphQLString,
    description: 'Check if this server is alive (an example query).',
    async resolve(source, {userId}, {authToken}) {
      requireSU(authToken);
      return 'pong!';
    }
  },
  autopauseUsers: {
    type: GraphQLInt,
    description: 'automatically pause users that have been inactive for 30 days. returns the number of users paused',
    resolve: async(source, args, {authToken}) => {
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
              )
            })
          }))
          .do(() => {
            return r.table('User')
              .get(userId)
              .update({
                inactive: true
              })
          })
      });
      await Promise.all(updates);
      const adjustmentPromises = users.map((user, idx) => {
        const orgIds = user.userOrgs.map(({id}) => id);
        // wrap the timeouts in a promise so we encapsulate all the work within the function (so we can measure duration)
        return new Promise((resolve) => {
          // stagger the calls because we are using the 1-second resolution prorationDate as the lookup key
          setTimeout(async() => {
            await adjustUserCount(user.id, orgIds, AUTO_PAUSE_USER);
            resolve();
          }, idx * AUTO_PAUSE_THROTTLE)
        })
      });

      await Promise.all(adjustmentPromises);
      return users.length;
    }
  }
};
