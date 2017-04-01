import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import getRethink from 'server/database/rethinkDriver';
import {
  requireSUOrLead,
  requireWebsocket
} from 'server/utils/authorization';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLString
} from 'graphql';
import shortid from 'shortid';
import {KICK_OUT, USER_MEMO} from 'universal/subscriptions/constants';
import {TEAM_ARCHIVED} from 'universal/utils/constants';

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
    requireSUOrLead(authToken, teamId);
    requireWebsocket(socket);

    // RESOLUTION
    const dbResult = await r.table('Team')
      .get(teamId)
      .pluck('name', 'orgId')
      .do((team) => ({
        projectCount: r.table('Project').getAll(teamId, {index: 'teamId'}).count(),
        team,
        userIds: r.table('TeamMember').getAll(teamId, {index: 'teamId'})('userId').coerceTo('array')
      }))
      .do((doc) => r.table('User')
        .getAll(r.args(doc('userIds')), {index: 'id'})
        .update((user) => ({tms: user('tms').difference([teamId])}), {returnChanges: true})
        .do((userResult) => r.branch(
          r.and(doc('projectCount').eq(0), doc('userIds').count().eq(1)),
          {
            // Team has no projects nor addn'l TeamMembers, hard delete it:
            team: doc('team'),
            teamResult: r.table('Team').get(teamId).delete(),
            teamMemberResult: r.table('TeamMember').getAll(teamId, {index: 'teamId'}).delete(),
            userResult,
          },
          {
            // Team has data or TeamMembers, archive team:
            notificationResult: r.table('Notification').insert({
              id: shortid.generate(),
              orgId: doc('team')('orgId'),
              startAt: now,
              type: TEAM_ARCHIVED,
              userIds: doc('userIds'),
              varList: [doc('team')('name')]
            }),
            team: doc('team'),
            teamResult: r.table('Team').get(teamId).update({isArchived: true}),
            userResult
          }
        ))
      );

    const {team: {name: teamName}, userResult: {changes: userChanges}} = dbResult;
    userChanges.forEach((change) => {
      const {id, tms} = change.new_val;
      // update the tms on auth0 in async
      auth0ManagementClient.users.updateAppMetadata({id}, {tms});
      // update the server socket, if they're logged in
      const channel = `${USER_MEMO}/${id}`;
      exchange.publish(channel, {type: KICK_OUT, teamId, teamName});
    });

    return true;
  }
};
