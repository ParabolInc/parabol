import {GraphQLID, GraphQLNonNull} from 'graphql';
import {fromGlobalId} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';
import RemoveSlackChannelPayload from 'server/graphql/types/RemoveSlackChannelPayload';
import {requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {SLACK} from 'universal/utils/constants';

export default {
  name: 'RemoveSlackChannel',
  description: 'Remove a slack channel integration from a team',
  type: new GraphQLNonNull(RemoveSlackChannelPayload),
  args: {
    slackGlobalId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (source, {slackGlobalId}, {authToken, socket}) => {
    const r = getRethink();
    const {id} = fromGlobalId(slackGlobalId);
    // AUTH
    const integration = await r.table(SLACK).get(id);
    if (!integration) {
      // no UI for this
      throw new Error(`${slackGlobalId} does not exist`);
    }
    const {teamId, isActive} = integration;
    requireSUOrTeamMember(authToken, teamId);
    requireWebsocket(socket);

    // VALIDATION
    if (!isActive) {
      // no UI for this
      throw new Error(`${slackGlobalId} has already been removed`);
    }
    // RESOLUTION

    await r.table(SLACK).get(id)
      .update({
        isActive: false
      });
    const slackChannelRemoved = {
      deletedId: slackGlobalId
    };
    getPubSub().publish(`slackChannelRemoved.${teamId}`, {slackChannelRemoved, mutatorId: socket.id});
    return slackChannelRemoved;
  }
};
