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
    description: 'automatically pause users that have been inactive for 30 days',
    resolve: async(source, args, {authToken}) => {
      const r = getRethink();

      // AUTH
      requireSU(authToken);

      // RESOLUTION
      const activeThresh = Date.now() - AUTO_PAUSE_THRESH;
      const users = await r.table('User')
        .filter((user) => user('lastSeenAt').le(r.epochTime(activeThresh)))
        .filter({
          inactive: false
        })
        .pluck('id', 'userOrgs');
      const userIds = users.map(({id}) => id);
      // const orgIds = await r.table('Organization')
      //   .getAll(r.args(userIds), {index: 'orgUsers'})
      //   .pluck('id', 'periodStart', 'periodEnd', 'stripeSubscriptionId');
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
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const orgIds = user.userOrgs.map(({id}) => id);
        setTimeout(() => {
          // stagger the calls because we are using the 1-second resolution prorationDate as the lookup key
          adjustUserCount(user.id, orgIds, AUTO_PAUSE_USER);
        }, AUTO_PAUSE_THROTTLE * i);
      }
    }
  }
};
