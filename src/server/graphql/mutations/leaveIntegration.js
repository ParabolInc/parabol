import {GraphQLID, GraphQLNonNull} from 'graphql';
import {fromGlobalId} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';
import LeaveIntegrationPayload from 'server/graphql/types/LeaveIntegrationPayload';
import {getUserId, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {GITHUB} from 'universal/utils/constants';

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
    const {id: localId, type: service} = fromGlobalId(globalId);

    // AUTH
    const userId = getUserId(authToken);
    requireWebsocket(socket);
    const integration = await r.table(service).get(localId);
    if (!integration) {
      throw new Error('That integration does not exist');
    }
    const {teamId, userIds} = integration;
    requireSUOrTeamMember(authToken, teamId);

    // VALIDATION
    if (!authToken.tms.includes(teamId)) {
      throw new Error('You must be a part of the team to leave the team')
    }

    if (!userIds.includes(userId)) {
      throw new Error('You are not a part of this integration');
    }

    // RESOLUTION
    const updatedIntegration = await r.table(service).get(localId)
      .update((doc) => ({
        userIds: doc('userIds').difference([userId]),
        isActive: doc('userIds').eq([userId]).not()
      }), {returnChanges: true})('changes')(0)('new_val').default(null);

    if (!updatedIntegration) {
      throw new Error('Integration was already updated');
    }

    const integrationLeft = {
      globalId,
      userId: updatedIntegration.isActive ? userId : null
    };

    if (service === GITHUB) {
      if (updatedIntegration.isActive === false) {
        // TODO get rid of the cards, etc
      }
    }
    getPubSub().publish(`integrationLeft.${teamId}.${service}`, {integrationLeft, mutatorId: socket.id});
    return integrationLeft;
  }
};

