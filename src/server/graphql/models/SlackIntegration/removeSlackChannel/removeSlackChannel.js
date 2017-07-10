import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql';
import {fromGlobalId} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';
import getPubSub from 'server/graphql/pubsub';
import {requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import {errorObj} from 'server/utils/utils';

export const RemoveSlackChannelPayload = new GraphQLObjectType({
  name: 'RemoveSlackChannelPayload',
  fields: () => ({
    deletedId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  })
});

const removeSlackChannel = {
  name: 'RemoveSlackChannel',
  description: 'Remove a slack channel integration from a team',
  type: RemoveSlackChannelPayload,
  args: {
    slackGlobalId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (source, {slackGlobalId}, {authToken, socket}) => {
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
    console.log('publishing removal', slackGlobalId);
    const slackChannelRemoved = {deletedId: slackGlobalId};
    getPubSub().publish(`slackChannelRemoved.${teamId}`, {slackChannelRemoved, mutatorId: socket.id});
    return slackChannelRemoved;
  }
};

export default removeSlackChannel;
