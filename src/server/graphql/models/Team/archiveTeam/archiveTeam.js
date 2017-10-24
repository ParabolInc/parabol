import {GraphQLBoolean, GraphQLNonNull, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import {getUserId, requireSUOrLead, requireWebsocket} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import sendSegmentEvent from 'server/utils/sendSegmentEvent';
import tmsSignToken from 'server/utils/tmsSignToken';
import shortid from 'shortid';
import {NEW_AUTH_TOKEN, NOTIFICATIONS_ADDED, TEAM_ARCHIVED} from 'universal/utils/constants';

export default {
  type: GraphQLBoolean,
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The teamId to archive (or delete, if team is unused)'
    }
  },
  async resolve(source, {teamId}, {authToken, socket}) {
    const r = getRethink();
    const now = new Date();

    // AUTH
    const userId = getUserId(authToken);
    const teamMemberId = `${userId}::${teamId}`;
    requireSUOrLead(authToken, teamMemberId);
    requireWebsocket(socket);

    // RESOLUTION
    sendSegmentEvent('Archive Team', userId, {teamId});
    const {teamResults: {notification}, userDocs} = await r.table('Team')
      .get(teamId)
      .pluck('name', 'orgId')
      .do((team) => ({
        projectCount: r.table('Project').getAll(teamId, {index: 'teamId'}).count(),
        team,
        userIds: r.table('TeamMember')
          .getAll(teamId, {index: 'teamId'})
          .filter({isNotRemoved: true})('userId')
          .coerceTo('array')
      }))
      .do((doc) => ({
        userDocs: r.table('User')
          .getAll(r.args(doc('userIds')), {index: 'id'})
          .update((user) => ({tms: user('tms').difference([teamId])}), {returnChanges: true})('changes')('new_val')
          .pluck('id', 'tms')
          .default([]),
        teamName: doc('team')('name'),
        teamResults: r.branch(
          r.and(doc('projectCount').eq(0), doc('userIds').count().eq(1)),
          {
            // Team has no projects nor addn'l TeamMembers, hard delete it:
            teamResult: r.table('Team').get(teamId).delete(),
            teamMemberResult: r.table('TeamMember').getAll(teamId, {index: 'teamId'}).delete()
          },
          {
            // Team has data or TeamMembers, archive team:
            notification: r.table('Notification').insert({
              id: shortid.generate(),
              orgId: doc('team')('orgId'),
              startAt: now,
              type: TEAM_ARCHIVED,
              userIds: doc('userIds'),
              teamName: doc('team')('name')
            }, {returnChanges: true})('changes')(0)('new_val').default(null),
            teamResult: r.table('Team').get(teamId).update({isArchived: true})
          }
        )
      }));

    if (notification) {
      const notificationsAdded = {notifications: [notification]};
      getPubSub().publish(`${NOTIFICATIONS_ADDED}.${teamId}`, {notificationsAdded});
    }
    userDocs.forEach((user) => {
      const {id, tms} = user;
      // update the tms on auth0 in async
      auth0ManagementClient.users.updateAppMetadata({id}, {tms});
      // update the server socket, if they're logged in
      getPubSub().publish(`${NEW_AUTH_TOKEN}.${id}`, {newAuthToken: tmsSignToken({sub: userId}, tms)});
    });

    return true;
  }
};
