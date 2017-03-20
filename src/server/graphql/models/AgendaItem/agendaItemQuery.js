import getRethink from 'server/database/rethinkDriver';
import {GraphQLNonNull, GraphQLID, GraphQLInt} from 'graphql';
import {requireSUOrTeamMember} from 'server/utils/authorization';

export default {
  agendaCount: {
    type: GraphQLInt,
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'teamId the agenda belongs to'
      }
    },
    async resolve(source, {teamId}, {authToken}) {
      const r = getRethink();

      // AUTH
      requireSUOrTeamMember(authToken, teamId);

      // RESOLUTION
      return r.table('AgendaItem')
        .getAll(teamId, {index: 'teamId'})
        .filter({isActive: true})
        .count()
        .run();
    }
  }
};
