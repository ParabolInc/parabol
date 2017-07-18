import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {IntegrationService} from 'server/graphql/types/IntegrationService';
import {getUserId, requireWebsocket} from 'server/utils/authorization';
import serviceToProvider from 'server/utils/serviceToProvider';

// Will use this when GH comes
export default {
  type: GraphQLBoolean,
  description: 'Remove yourself from an integration',
  args: {
    integrationId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the id of the integration to remove'
    },
    service: {
      type: new GraphQLNonNull(IntegrationService),
      description: 'The name of the service like slack or github'
    }
  },
  async resolve(source, {integrationId, service}, {authToken, socket}) {
    const r = getRethink();

    // AUTH
    const userId = getUserId(authToken);
    requireWebsocket(socket);

    const table = serviceToProvider[service];
    const integration = await r.table(table).get(integrationId);

    // VALIDATION
    if (!integration) {
      throw new Error('That integration does not exist');
    }
    if (!authToken.tms.includes(integration.teamId)) {
      throw new Error('You must be a part of the team to leave the team')
    }

    if (!integration.userIds.includes(userId)) {
      throw new Error('You are not a part of this integration');
    }

    // RESOLUTION
    const updatedIntegration = await r.table(table).get(integrationId)
      .update((doc) => ({
        //blackList: doc('blackList').append(userId).distinct(),
        userIds: doc('userIds').difference([userId]),
        isActive: doc('userIds').count().ne(0)
      }), {returnChanges: true})('changes')(0)('new_val').default(null);

    if (!updatedIntegration) {
      throw new Error('Integration was already updated');
    }

    if (updatedIntegration.isActive === false) {
      // TODO get rid of the cards, etc
    }

    return true;
  }
};

