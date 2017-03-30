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

    // AUTH
    requireSUOrLead(authToken, updatedTeam.id);
    requireWebsocket(socket);

    // VALIDATION
    const {errors, data: {id, name, isArchived}} = archiveTeamValidation()(updatedTeam);
    handleSchemaErrors(errors);

    // RESOLUTION
    await r.db('actionDevelopment').table('Team')
      .get(id)
      .pluck('orgId')
      .do((doc) => {
        return ({
          orgId: doc('orgId'),
          userIds: r.db('actionDevelopment').table('TeamMember').getAll(id, {index: 'teamId'})
          .pluck('userId')
          .coerceTo('array')
          .map((doc) => doc('userId'))
        })
      })
      .do((doc) => {
        return r.db('actionDevelopment').table('Notification').insert({
          id: shortid.generate(),
          type: TEAM_ARCHIVED,
          startAt: r.now(),
          orgId: doc('orgId'),
          userIds: doc('userIds'),
          varList: [name]
        })
      })
      .do(() => {
        return r.db('actionDevelopment').table('Team').get(id).update({isArchived})
      })

    return true;
  }
};
