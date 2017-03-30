import getRethink from 'server/database/rethinkDriver';
import {
  requireSUOrLead,
  requireWebsocket
} from 'server/utils/authorization';
import {handleSchemaErrors} from 'server/utils/utils';
import {
  GraphQLNonNull,
  GraphQLBoolean,
} from 'graphql';
import {TeamInput} from '../teamSchema';
import shortid from 'shortid';
import {TEAM_ARCHIVED} from 'universal/utils/constants';
import archiveTeamValidation from './archiveTeamValidation';

export default {
  type: GraphQLBoolean,
  args: {
    updatedTeam: {
      type: new GraphQLNonNull(TeamInput),
      description: 'The input object containing the teamId and any modified fields'
    }
  },
  async resolve(source, {updatedTeam}, {authToken, socket}) {
    const r = getRethink();
    const now = new Date();

    // AUTH
    requireSUOrLead(authToken, updatedTeam.id);
    requireWebsocket(socket);

    // VALIDATION
    const {errors, data: {id, name, isArchived}} = archiveTeamValidation()(updatedTeam);
    handleSchemaErrors(errors);

    // RESOLUTION
    await r.table('Team')
      .get(id)('orgId')
      .do((orgId) => ({
        orgId,
        projectCount: r.table('Project').getAll(id, {index: 'teamId'}).count(),
        userIds: r.table('TeamMember').getAll(id, {index: 'teamId'})('userId').coerceTo('array')
      }))
      .do((doc) => r.branch(
        r.and(doc('projectCount').eq(0), doc('userIds').count().eq(1)),
        {
          // Team has no projects nor addn'l TeamMembers, hard delete it:
          teamResult: r.table('Team').get(id).delete(),
          teamMemberResult: r.table('TeamMember').getAll(id, {index: 'teamId'}).delete(),
          userResult: r.table('User').get(doc('userIds').nth(0))
            .do((user) =>
              // remove team from user tms, N.B. we don't bother issuing a new token
              r.table('User').get(user('id')).update({tms: user('tms').difference([id])})
            )
        },
        {
          // Team has data or TeamMembers, archive team:
          notificationResult: r.table('Notification').insert({
            id: shortid.generate(),
            orgId: doc('orgId'),
            startAt: now,
            type: TEAM_ARCHIVED,
            userIds: doc('userIds'),
            varList: [name]
          }),
          teamResult: r.table('Team').get(id).update({isArchived})
        }
      ));

    /*
     * TODO: in the future (where everything is better) we could return
     * a new token with the tms field ommitting the deleted team.
     */

    return true;
  }
};
