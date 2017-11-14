import {GraphQLInt, GraphQLList, GraphQLString} from 'graphql';
import adjustUserCount from 'server/billing/helpers/adjustUserCount';
import getRethink from 'server/database/rethinkDriver';
import {sendBatchEmail} from 'server/email/sendEmail';
import endMeeting from 'server/graphql/models/Team/endMeeting/endMeeting';
import {requireSU} from 'server/utils/authorization';
import sendSegmentEvent from 'server/utils/sendSegmentEvent';
import {AUTO_PAUSE_THRESH, AUTO_PAUSE_USER, OLD_MEETING_AGE} from 'server/utils/serverConstants';

const intranetPing = {
  type: GraphQLString,
  description: 'Check if this server is alive (an example query).',
  async resolve(source, args, {authToken}) {
    requireSU(authToken);
    return 'pong!';
  }
};

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

const endOldMeetings = {
  type: GraphQLInt,
  description: 'close all meetings that started before the given threshold',
  resolve: async (source, args, {authToken}) => {
    const r = getRethink();

    // AUTH
    requireSU(authToken);

    // RESOLUTION
    const activeThresh = new Date(Date.now() - OLD_MEETING_AGE);
    const idPairs = await r.table('Meeting')
      .group({index: 'teamId'}) // for each team
      .max('createdAt') // get the most recent meeting only
      .ungroup()('reduction') // return as sequence
      .filter({endedAt: null}, {default: true}) // filter to unended meetings
      .filter(r.row('createdAt').le(activeThresh))('teamId') // filter to old meetings, return teamIds
      .do((teamIds) => r.table('TeamMember')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter({isLead: true})
        .pluck('teamId', 'userId')
      ); // join by team leader userId
    const promises = idPairs.map(async ({teamId, userId}) => {
      await endMeeting.resolve(undefined, {teamId}, {authToken, socket: {}});
      sendSegmentEvent('endOldMeeting', userId, {teamId});
    });
    await Promise.all(promises);
    return idPairs.length;
  }
};

const sendBatchNotificationEmails = {
  type: new GraphQLList(GraphQLString),
  description: 'Send summary emails of unread notifications to all users who have not been seen within the last 24 hours',
  async resolve(source, args, {authToken}) {
    // AUTH
    requireSU(authToken);

    // RESOLUTION
    // Note - this may be a lot of data one day. userNotifications is an array
    // of all the users who have not logged in within the last 24 hours and their
    // associated notifications.
    const r = getRethink();
    const now = Date.now();
    const today = new Date(now);
    const yesterday = new Date(now - (24 * 60 * 60 * 1000));
    const userNotifications = await r
      .table('Notification')
      // Only include notifications which occurred within the last day
      .filter(r.row('startAt').gt(yesterday))
      // flatten into one notification per user
      .concatMap((notification) =>
        notification('userIds').map((userId) => ({userId, notification}))
      )
      // join with the users table
      .eqJoin('userId', r.table('User'))
      // filter to active users not seen within the last day
      .filter(r.and(
        r.row('right')('inactive').eq(false),
        r.row('right')('lastSeenAt').lt(yesterday)
      ))
      // clean up the join
      .map((join) => ({
        userId: join('right')('id'),
        email: join('right')('email'),
        preferredName: join('right')('preferredName'),
        notification: join('left')('notification')
      }))
      // de-dup users
      .group('userId')
      .ungroup()
      .map((group) => ({
        userId: group('group'),
        email: group('reduction')(0)('email'),
        name: group('reduction')(0)('preferredName'),
        numNotifications: group('reduction').count()
      }));

    const emails = userNotifications.map(({email}) => email);
    const recipientVariables = userNotifications
      .reduce((addressMap, {email, name, numNotifications}) => ({
        ...addressMap,
        [email]: {name, numNotifications}
      }), {});
    if (emails.length) {
      await sendBatchEmail(
        emails,
        'notificationSummary',
        {date: today},
        recipientVariables
      );
    }
    return emails;
  }
};

export default {
  autopauseUsers,
  endOldMeetings,
  intranetPing,
  sendBatchNotificationEmails
};
