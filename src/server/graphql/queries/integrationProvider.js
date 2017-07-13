import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import Provider from 'server/graphql/types/Provider';
import {getUserId, requireSUOrTeamMember} from 'server/utils/authorization';
import {SLACK} from 'universal/utils/constants';

export default {
  type: Provider,
  description: 'get an integration provider belonging to the user',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The unique team member Id'
    },
    service: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The name of the service'
    }
  },
  resolve: async (source, {teamId, service}, {authToken}) => {
    const r = getRethink();

    // AUTH
    const userId = getUserId(authToken);
    requireSUOrTeamMember(authToken, teamId);

    // RESOLUTION
    return r.table('Provider')
      .getAll(teamId, {index: 'teamIds'})
      .filter({service})
      .filter((doc) => doc('service').eq(SLACK).or(doc('userId').eq(userId)))
      .nth(0)
      .default(null);
  }
};
