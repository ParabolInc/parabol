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
import {TEAM_ARCHIVED, TEAM_DELETED} from 'universal/utils/constants';
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
    const notificationTemplate = {
      id: shortid.generate(),
      startAt: now,
      varList: [name]
    };
    await r.table('Team')
      .get(id)
      .pluck('orgId')
      .do((doc) => ({
        orgId: doc('orgId'),
        projectCount: r.table('Project').getAll(id, {index: 'teamId'}).count(),
        userIds: r.table('TeamMember').getAll(id, {index: 'teamId'})
        .pluck('userId')
        .coerceTo('array')
        .map((newDoc) => newDoc('userId'))
      }))
      .do((doc) => ({
        opType: r.branch(
          r.and(doc('projectCount').eq(0), doc('userIds').count().eq(1)),
          TEAM_DELETED,
          TEAM_ARCHIVED
        ),
        orgId: doc('orgId'),
        userIds: doc('userIds')
      }))
      .do((doc) => ({
        opType: doc('opType'),
        notificationResult: r.table('Notification').insert({
          ...notificationTemplate,
          type: doc('opType'),
          orgId: doc('orgId'),
          userIds: doc('userIds'),
        }),
        teamResult: r.branch(
          doc('opType').eq(TEAM_ARCHIVED),
          r.table('Team').get(id).update({isArchived}),
          r.table('Team').get(id).delete()
        ),
        teamMemberResult: r.branch(
          doc('opType').eq(TEAM_ARCHIVED),
          null,
          r.table('TeamMember').getAll(id, {index: 'teamId'}).delete()
        ),
        userResult: r.branch(
          doc('opType').eq(TEAM_ARCHIVED),
          null,
          r.table('User').getAll(r.args(doc('userIds'))).forEach((user) =>
            r.table('User').get(user('id')).update({
              // remove team from user tms, N.B. we don't bother issuing a new token
              tms: user('tms').difference([id])
            })
          )
        )
      }));

    /*
     * TODO: in the future (where everything is better) we could return
     * a new token with the tms field ommitting the deleted team.
     */

    return true;
  }
};
