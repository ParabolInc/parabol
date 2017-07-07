import {GraphQLID, GraphQLNonNull} from 'graphql';
import {connectionArgs, connectionFromArray} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';
import {ProviderConnection} from 'server/graphql/models/Provider/providerSchema';
import {requireSUOrSelf, requireSUOrTeamMember} from 'server/utils/authorization';

export default {
  providerList: {
    type: ProviderConnection,
    description: 'paginated list of providers',
    args: {
      ...connectionArgs,
      teamMemberId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique team member Id'
      }
    },
    resolve: async (source, {teamMemberId, ...conArgs}, {authToken}) => {
      const r = getRethink();

      // AUTH
      const [userId, teamId] = teamMemberId.split('::');
      requireSUOrSelf(authToken, userId);
      requireSUOrTeamMember(authToken, teamId);

      // RESOLUTION
      const allProviders = await r.table('Provider')
        .getAll(teamId, {index: 'teamIds'})
        .filter({userId})
        .orderBy('createdAt');
      return connectionFromArray(allProviders, conArgs);
    }
  }
};
