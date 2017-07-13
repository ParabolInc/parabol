import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import ProviderMap from 'server/graphql/types/ProviderMap';
import {getUserId, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import serviceToProvider from 'server/utils/serviceToProvider';
import {SLACK} from 'universal/utils/constants';

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
      .group('service');

    const providerMap = allProviders.reduce((map, obj) => {
      const service = obj.group;
      if (service === SLACK) {
        const teamProvider = obj.reduction[0];
        const {accessToken} = teamProvider;
        map[service] = {
          accessToken,
          teamId
        };
      } else {
        const userCount = obj.reduction.length;
        const userDoc = obj.reduction.find((doc) => doc.userId === userId);
        const accessToken = userDoc ? userDoc.accessToken : undefined;
        const providerUserName = userDoc ? userDoc.providerUserName : undefined;
        map[service] = {
          userCount,
          accessToken,
          providerUserName
        };
      }
      return map;
    }, {});
    const services = Object.keys(providerMap);
    const promises = services.map((service) => {
      const table = serviceToProvider[service];
      return r.table(table)
        .getAll(teamId, {index: 'teamId'})
        .count();
    });

    const integrationCounts = await Promise.all(promises);
    // mutates providerMap
    services.forEach((service, idx) => {
      providerMap[service].integrationCount = integrationCounts[idx];
    });

    // add teamId so the resolver can generate an ID for easy updates
    providerMap.teamId = teamId;
    return providerMap;
  }
};
