import {GraphQLBoolean, GraphQLNonNull, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import {getUserId, requireSUOrLead, requireWebsocket} from 'server/utils/authorization';
import sendSegmentEvent from 'server/utils/sendSegmentEvent';
import shortid from 'shortid';
import {KICK_OUT, USER_MEMO} from 'universal/subscriptions/constants';
import {NOTIFICATION_ADDED, TEAM_ARCHIVED} from 'universal/utils/constants';
import getPubSub from 'server/utils/getPubSub';

export default {
  type: GraphQLBoolean,
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The teamId to archive (or delete, if team is unused)'
    }
  },
  async resolve(source, {teamId}, {authToken, exchange, socket}) {
    const r = getRethink();
    const now = new Date();

    // AUTH
    const userId = getUserId(authToken);
    const teamMemberId = `${userId}::${teamId}`;
    requireSUOrLead(authToken, teamMemberId);
    requireWebsocket(socket);

    // RESOLUTION
    sendSegmentEvent('Archive Team', userId, {teamId});
    const dbResult = await r.table('Team')
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
          .update((user) => ({tms: user('tms').difference([teamId])}), {returnChanges: true})('changes')
          .map((change) => change('new_val'))
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
            notificationAdded: r.table('Notification').insert({
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

    const {teamResults: {notificationAdded}, teamName, userDocs} = dbResult;
    userDocs.forEach((user) => {
      const {id, tms} = user;
      // update the tms on auth0 in async
      auth0ManagementClient.users.updateAppMetadata({id}, {tms});
      // update the server socket, if they're logged in
      const channel = `${USER_MEMO}/${id}`;
      exchange.publish(channel, {type: KICK_OUT, teamId, teamName});
      getPubSub().publish(`${NOTIFICATION_ADDED}.${id}`, {notificationAdded});
    });

    return true;
  }
};
