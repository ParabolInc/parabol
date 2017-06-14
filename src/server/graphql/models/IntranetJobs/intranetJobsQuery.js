import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLString,
  GraphQLInt
} from 'graphql';
import {getUserSegmentTraits, requireSU} from 'server/utils/authorization';
import {
  AUTO_PAUSE_THRESH,
  AUTO_PAUSE_USER,
  OLD_MEETING_AGE
} from 'server/utils/serverConstants';
import adjustUserCount from 'server/billing/helpers/adjustUserCount';
import endMeeting from 'server/graphql/models/Team/endMeeting/endMeeting';
import segmentIo from 'server/utils/segmentIo';

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
  },
  endOldMeetings: {
    type: GraphQLInt,
    description: 'close all meetings that started before the given threshold',
    resolve: async (source, args, {authToken}) => {
      const r = getRethink();

      // AUTH
      requireSU(authToken);

      // RESOLUTION
      const activeThresh = new Date(Date.now() - OLD_MEETING_AGE);
      const idPairs = await r.table('Meeting')
        .group({index: 'teamId'})                               // for each team
        .max('createdAt')                                       // get the most recent meeting only
        .ungroup()('reduction')                                 // return as sequence
        .filter({ endedAt: null }, { default: true })           // filter to unended meetings
        .filter(r.row('createdAt').le(activeThresh))('teamId')  // filter to old meetings, return teamIds
        .do((teamIds) => r.db('actionProduction').table('TeamMember')
          .getAll(r.args(teamIds), {index: 'teamId'})
          .filter({isLead: true})
        )                                                       // join by team leader userId
        .pluck('teamId', 'userId');
      const promises = idPairs.map(async ({teamId, userId}) => {
        await endMeeting.resolve(undefined, {teamId}, {authToken, socket: {}});
        const segmentTraits = await getUserSegmentTraits(userId);
        segmentIo.track({
          userId,
          event: 'endOldMeeting',
          properties: {
            teamId,
            traits: segmentTraits
          }
        });
      });
      await Promise.all(promises);
      return idPairs.length;
    }
  }
};
