import {GraphQLID, GraphQLNonNull, GraphQLInputObjectType} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import AddSlackChannelPayload from 'server/graphql/types/AddSlackChannelPayload';
import getPubSub from 'server/utils/getPubSub';
import {requireSUOrSelf, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import {SLACK} from 'universal/utils/constants';
import insertSlackChannel from 'server/safeMutations/insertSlackChannel';

const AddSlackChannelInput = new GraphQLInputObjectType({
  name: 'AddSlackChannelInput',
  fields: () => ({
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the teamMember calling it.'
    },
    slackChannelId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the slack channel that wants our messages'
    }
  })
});

export default {
  name: 'AddSlackChannel',
  type: new GraphQLNonNull(AddSlackChannelPayload),
  args: {
    input: {
      type: new GraphQLNonNull(AddSlackChannelInput)
    }
  },
  resolve: async (source, {input: {teamMemberId, slackChannelId}}, {authToken, socket}) => {
    const r = getRethink();

    // AUTH
    const [userId, teamId] = teamMemberId.split('::');
    requireSUOrSelf(authToken, userId);
    requireSUOrTeamMember(authToken, teamId);
    requireWebsocket(socket);

    // VALIDATION

    // get the user's token
    const provider = await r.table('Provider')
      .getAll(teamId, {index: 'teamIds'})
      .filter({service: SLACK})
      .nth(0)
      .default(null);

    if (!provider || !provider.accessToken) {
      throw new Error('No Slack Provider found! Try refreshing your token');
    }

    // see if the slackChannelId is legit
    const {accessToken} = provider;
    const channelInfoUrl = `https://slack.com/api/channels.info?token=${accessToken}&channel=${slackChannelId}`;
    const channelInfo = await fetch(channelInfoUrl);
    const channelInfoJson = await channelInfo.json();
    const {ok, channel} = channelInfoJson;
    if (!ok) {
      throw new Error(channelInfoJson.error);
    }

    const {is_archived: isArchived, name} = channel;
    if (isArchived) {
      throw new Error(`Slack channel ${name} is archived!`);
    }

    // RESOLUTION
    const newChannel = await insertSlackChannel(slackChannelId, name, teamId);
    const slackChannelAdded = {
      channel: newChannel
    };
    getPubSub().publish(`slackChannelAdded.${teamId}`, {slackChannelAdded, mutatorId: socket.id});
    return slackChannelAdded;
  }
};
