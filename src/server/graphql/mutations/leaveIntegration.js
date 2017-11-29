import {GraphQLID, GraphQLNonNull} from 'graphql';
import {fromGlobalId} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';
import LeaveIntegrationPayload from 'server/graphql/types/LeaveIntegrationPayload';
import archiveTasksByGitHubRepo from 'server/safeMutations/archiveTasksByGitHubRepo';
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
    const {adminUserId, teamId, userIds} = integration;
    requireSUOrTeamMember(authToken, teamId);

    // VALIDATION
    if (!authToken.tms.includes(teamId)) {
      throw new Error('You must be a part of the team to leave the team');
    }

    if (!userIds.includes(userId)) {
      throw new Error('You are not a part of this integration');
    }

    if (userId === adminUserId) {
      throw new Error('The repo admin cannot leave the repo');
    }

    // RESOLUTION
    const updatedIntegration = await r.table(service).get(localId)
      .update((doc) => ({
        userIds: doc('userIds').difference([userId]),
        isActive: doc('adminUserId').eq(userId).not()
      }), {returnChanges: true})('changes')(0)('new_val').default(null);

    if (!updatedIntegration) {
      throw new Error('Integration was already updated');
    }

    const {isActive, nameWithOwner} = updatedIntegration;
    let archivedTaskIds = [];
    if (isActive === false) {
      if (service === GITHUB) {
        archivedTaskIds = await archiveTasksByGitHubRepo(teamId, nameWithOwner);
      }
    }

    const integrationLeft = {
      globalId,
      userId: isActive ? userId : null,
      archivedTaskIds
    };
    getPubSub().publish(`integrationLeft.${teamId}.${service}`, {integrationLeft, mutatorId: socket.id});
    return integrationLeft;
  }
};

