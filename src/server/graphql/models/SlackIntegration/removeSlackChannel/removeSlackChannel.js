import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import {errorObj} from 'server/utils/utils';

export default {
  type: GraphQLBoolean,
  description: 'Remove a slack channel integration from a team',
  args: {
    //teamMemberId: {
    //  type: new GraphQLNonNull(GraphQLID),
    //  description: 'The id of the teamMember calling it.'
    //},
    slackChannelId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the unique id for this slack integration'
    }
  },
  async resolve(source, {slackChannelId}, {authToken, socket}) {
    const r = getRethink();

    // AUTH
    const integration = await r.table('SlackIntegration').get(slackChannelId);
    const {teamId, isActive} = integration;
    requireSUOrTeamMember(authToken, teamId);
    requireWebsocket(socket);

    // VALIDATION
    if (!isActive) {
      throw errorObj({_error: `${slackChannelId} has already been removed`});
    }
    // RESOLUTION
    await r.table('SlackIntegration').get(slackChannelId)
      .update({
        isActive: false
      });
    return true;
  }
};

