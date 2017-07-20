import {GraphQLID, GraphQLNonNull} from 'graphql';
import {fromGlobalId} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';
import JoinIntegrationPayload from 'server/graphql/types/JoinIntegrationPayload';
import {getUserId, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';

export default {
  type: new GraphQLNonNull(JoinIntegrationPayload),
  description: 'Remove a user from an integration',
  args: {
    globalId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The global id of the integration to join'
    }
  },
  async resolve(source, {globalId}, {authToken, socket}) {
    const r = getRethink();

    // AUTH
    requireWebsocket(socket);
    const userId = getUserId(authToken);
    const {id: localId, type: service} = fromGlobalId(globalId);
    const integration = await r.table(service).get(localId);
    if (!integration) {
      throw new Error('That integration does not exist');
    }
    const {teamId, userIds} = integration;
    requireSUOrTeamMember(authToken, teamId);

    // VALIDATION
    if (!authToken.tms.includes(teamId)) {
      throw new Error('You must be a part of the team to join the team');
    }

    if (userIds.includes(userId)) {
      throw new Error('You are already a part of this integration');
    }

    // RESOLUTION
    const updatedIntegration = await r.table(service).get(localId)
      .update((doc) => ({
        userIds: doc('userIds').append(userId).distinct()
      }), {returnChanges: true})('changes')(0)('new_val').default(null);

    if (!updatedIntegration) {
      throw new Error('Integration was already updated');
    }
    const teamMemberId = `${userId}::${teamId}`;
    const teamMember = await r.table('TeamMember').get(teamMemberId);
    if (!teamMember) {
      throw new Error('Team member not found!');
    }

    const integrationJoined = {
      globalId,
      teamMember
    };

    getPubSub().publish(`integrationJoined.${teamId}.${service}`, {integrationJoined, mutatorId: socket.id});
    return integrationJoined;
  }
};

