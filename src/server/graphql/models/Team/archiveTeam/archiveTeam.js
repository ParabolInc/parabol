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
import {TEAM_ARCHIVED} from 'universal/utils/constants';

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
    requireSUOrLead(authToken, teamId);
    requireWebsocket(socket);

    // RESOLUTION
    await r.table('Team')
      .get(teamId)
      .pluck('name', 'orgId')
      .do((team) => ({
        projectCount: r.table('Project').getAll(teamId, {index: 'teamId'}).count(),
        team,
        userIds: r.table('TeamMember').getAll(teamId, {index: 'teamId'})('userId').coerceTo('array')
      }))
      .do((doc) => r.branch(
        r.and(doc('projectCount').eq(0), doc('userIds').count().eq(1)),
        {
          // Team has no projects nor addn'l TeamMembers, hard delete it:
          teamResult: r.table('Team').get(teamId).delete(),
          teamMemberResult: r.table('TeamMember').getAll(teamId, {index: 'teamId'}).delete(),
          userResult: r.table('User').get(doc('userIds').nth(0))
            .do((user) =>
              // remove team from user tms, N.B. we don't bother issuing a new token
              r.table('User').get(user('id')).update({tms: user('tms').difference([teamId])})
            )
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
          teamResult: r.table('Team').get(teamId).update({isArchived: true})
        }
      ));

    /*
     * TODO: in the future (where everything is better) we could return
     * a new token with the tms field ommitting the deleted team.
     */

    return true;
  }
};
