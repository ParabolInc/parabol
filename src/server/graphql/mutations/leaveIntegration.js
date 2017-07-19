import {GraphQLID, GraphQLNonNull} from 'graphql';
import {fromGlobalId} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';
import LeaveIntegrationPayload from 'server/graphql/types/LeaveIntegrationPayload';
import {getUserId, requireWebsocket} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {integrationNames} from 'server/utils/serviceToProvider';

export default {
  type: new GraphQLNonNull(LeaveIntegrationPayload),
  description: 'Remove yourself from an integration',
  args: {
    globalId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the id of the integration to remove'
    }
  },
  async resolve(source, {globalId}, {authToken, socket}) {
    const r = getRethink();
    const {id, type: table} = fromGlobalId(globalId);
    // AUTH
    const userId = getUserId(authToken);
    requireWebsocket(socket);

    const integration = await r.table(table).get(id);
    // VALIDATION
    if (!integration) {
      throw new Error('That integration does not exist');
    }
    const {teamId, userIds} = integration;
    if (!authToken.tms.includes(teamId)) {
      throw new Error('You must be a part of the team to leave the team')
    }

    if (!userIds.includes(userId)) {
      throw new Error('You are not a part of this integration');
    }

    // RESOLUTION
    const updatedIntegration = await r.table(table).get(id)
      .update((doc) => ({
        //blackList: doc('blackList').append(userId).distinct(),
        userIds: doc('userIds').difference([userId]),
        isActive: doc('userIds').count().ne(0)
      }), {returnChanges: true})('changes')(0)('new_val').default(null);

    if (!updatedIntegration) {
      throw new Error('Integration was already updated');
    }

    const leaveIntegration = {
      integrationId: globalId,
      userId
    };

    if (table === 'GitHubIntegration') {
      if (updatedIntegration.isActive === false) {
        // TODO get rid of the cards, etc
      }
    }
    const {service} = integrationNames.find((name) => name.table === table);
    getPubSub().publish(`integrationLeft.${teamId}.${service}`, {leaveIntegration, mutatorId: socket.id});
    return leaveIntegration;
  }
};

