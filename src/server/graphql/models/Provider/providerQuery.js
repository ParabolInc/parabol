import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {requireSUOrSelf, requireSUOrTeamMember} from 'server/utils/authorization';
import Provider from 'server/graphql/models/Provider/providerSchema';
import {connectionArgs, connectionDefinitions, connectionFromArray} from 'graphql-relay';

const {connectionType: ProviderConnectionType} = connectionDefinitions({
  name: 'Provider',
  nodeType: Provider
});

export default {
  providers: {
    type: ProviderConnectionType,
    description: 'paginated list of providers',
    args: {
      ...connectionArgs,
      teamMemberId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique team member Id'
      }
    },
    resolve: async(source, {teamMemberId, ...conArgs}, {authToken}) => {
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
