import getRethink from 'server/database/rethinkDriver';
import {GraphQLNonNull, GraphQLID, GraphQLInt} from 'graphql';
import {requireSUOrTeamMember} from 'server/utils/authorization';

export default {
  teamMemberCount: {
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
      return r.table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .filter({isNotRemoved: true})
        .count()
        .run();
    }
  }
};
