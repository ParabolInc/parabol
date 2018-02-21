import {GraphQLID, GraphQLInputObjectType, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import AddSlackChannelPayload from 'server/graphql/types/AddSlackChannelPayload';
import insertSlackChannel from 'server/safeMutations/insertSlackChannel';
import {requireTeamMember} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {SLACK} from 'universal/utils/constants';
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId';
import fetch from 'node-fetch';

// TODO get rid of input and only request teamId not teamMemberId
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
  resolve: async (source, {input: {teamMemberId, slackChannelId}}, {authToken, socketId: mutatorId}) => {
    const r = getRethink();

    // AUTH
    // TODO replace teamMemberId with teamId, no need for the userId here?
    const {teamId} = fromTeamMemberId(teamMemberId);
    requireTeamMember(authToken, teamId);

    // VALIDATION

    // get the user's token
    const provider = await r.table('Provider')
      .getAll(teamId, {index: 'teamId'})
      .filter({service: SLACK, isActive: true})
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
    getPubSub().publish(`slackChannelAdded.${teamId}`, {slackChannelAdded, mutatorId});
    return slackChannelAdded;
  }
};
