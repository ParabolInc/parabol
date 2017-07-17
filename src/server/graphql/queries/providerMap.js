import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import ProviderMap from 'server/graphql/types/ProviderMap';
import {getUserId, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import serviceToProvider from 'server/utils/serviceToProvider';
import {CURRENT_PROVIDERS, SLACK} from 'universal/utils/constants';

const getUserReduction = (service, reduction, userId) => {
  if (service === SLACK) {
    return reduction[0];
  }
  return reduction.find((doc) => doc.userId === userId) || {};
};

export default {
  type: ProviderMap,
  description: 'The list of providers as seen on the integrations page',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The unique team member Id'
    }
  },
  resolve: async (source, {teamId}, {authToken, socket}) => {
    const r = getRethink();

    // AUTH
    const userId = getUserId(authToken);
    requireSUOrTeamMember(authToken, teamId);
    requireWebsocket(socket);


    // RESOLUTION
    const allProviders = await r.table('Provider')
      .getAll(teamId, {index: 'teamIds'})
      .group('service')
      .ungroup()
      .merge((row) => ({
        integrationCount: r.table(r.expr(serviceToProvider)(row('group')))
          .getAll(teamId, {index: 'teamId'})
          .filter({isActive: true})
          .count()
      }));

    const defaultMap = CURRENT_PROVIDERS.reduce((obj, service) => {
      obj[service] = {
        accessToken: null,
        service,
        teamId
      };
      return obj;
    }, {});

    const providerMap = allProviders.reduce((map, obj) => {
      const service = obj.group;
      const userDoc = getUserReduction(service, obj.reduction, userId);
      map[service] = {
        ...map[service],
        ...userDoc,
        userCount: obj.reduction.length,
        integrationCount: obj.integrationCount
      };
      return map;
    }, defaultMap);

    // add teamId so the resolver can generate an ID for easy updates
    providerMap.teamId = teamId;
    return providerMap;
  }
};
