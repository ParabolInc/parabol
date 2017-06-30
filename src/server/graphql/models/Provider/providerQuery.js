import {GraphQLID, GraphQLNonNull} from 'graphql';
import {connectionArgs, connectionDefinitions, connectionFromArray} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';
import Provider, {ProviderList} from 'server/graphql/models/Provider/providerSchema';
import {requireSUOrSelf, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';

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
  },
  providerList: {
    type: ProviderList,
    description: 'The list of providers as seen on the integrations page',
    args: {
      teamMemberId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique team member Id'
      }
    },
    resolve: async (source, {teamMemberId}, {authToken, socket}) => {
      const r = getRethink();

      // AUTH
      const [userId, teamId] = teamMemberId.split('::');
      requireSUOrSelf(authToken, userId);
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);


      // RESOLUTION

      // TODO write this once i have some sample data. abstract stuff is hard
      const allProviders = await r.table('Provider')
        .getAll(teamId, {index: 'teamIds'})
        .group('service');

      return allProviders;

    }
  }
};
