import {GraphQLID, GraphQLNonNull} from 'graphql';
import {fromGlobalId} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';
import JoinIntegrationPayload from 'server/graphql/types/JoinIntegrationPayload';
import maybeJoinRepos from 'server/safeMutations/maybeJoinRepos';
import {getUserId, requireTeamMember, requireWebsocket} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {GITHUB} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(JoinIntegrationPayload),
  description: 'Add a user to an integration',
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
    requireTeamMember(authToken, teamId);

    // VALIDATION
    if (!authToken.tms.includes(teamId)) {
      throw new Error('You must be a part of the team to join the team');
    }

    if (userIds.includes(userId)) {
      throw new Error('You are already a part of this integration');
    }

    const provider = await r.table('Provider')
      .getAll(teamId, {index: 'teamId'})
      .filter({service, userId, isActive: true})
      .nth(0)
      .default(null);
    if (!provider) {
      throw new Error('You must first connect your account to the integration');
    }

    // RESOLUTION
    // note: does not fail if they are already a member
    if (service === GITHUB) {
      const usersAndIntegrations = await maybeJoinRepos([integration], [provider]);
      const integrationIds = usersAndIntegrations[userId];
      if (integrationIds.length === 0) {
        throw new Error('You must be an org member or collaborator to join');
      }
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

