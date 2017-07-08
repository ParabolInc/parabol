import {GraphQLID, GraphQLNonNull} from 'graphql';
import {fromGlobalId, mutationWithClientMutationId} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';
import {requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import {errorObj} from 'server/utils/utils';
import getPubSub from 'server/graphql/pubsub';

const removeSlackChannel = mutationWithClientMutationId({
  name: 'RemoveSlackChannel',
  inputFields: {
    slackGlobalId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Remove a slack channel integration from a team'
    }
  },
  outputFields: {
    deletedIntegrationId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of SlackIntegration that got removed',
      resolve: ({id}) => {
        console.log('resolving deletedIntegrationId', id);
        return id;
      }
    }
  },
  mutateAndGetPayload: async ({slackGlobalId}, {authToken, socket}) => {
    const r = getRethink();
    const {id} = fromGlobalId(slackGlobalId);
    // AUTH
    const integration = await r.table('SlackIntegration').get(id);
    if (!integration) {
      throw errorObj({_error: `${slackGlobalId} does not exist`});
    }
    const {teamId, isActive} = integration;
    requireSUOrTeamMember(authToken, teamId);
    requireWebsocket(socket);

    // VALIDATION
    if (!isActive) {
      throw errorObj({_error: `${slackGlobalId} has already been removed`});
    }
    // RESOLUTION

    await r.table('SlackIntegration').get(id)
      .update({
        isActive: false
      });
    console.log('publishing removal', slackGlobalId)
    getPubSub().publish(`slackChannelRemoved.${teamId}`, {slackChannelRemoved: {deletedIntegrationId: slackGlobalId}, mutatorId: socket.id});
    return {id: slackGlobalId};
  }
});

export default removeSlackChannel;

export const RemoveSlackChannelPayload = removeSlackChannel.type;
