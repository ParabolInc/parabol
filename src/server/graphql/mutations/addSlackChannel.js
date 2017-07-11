import {GraphQLID, GraphQLNonNull, GraphQLInputObjectType} from 'graphql';
import {base64} from 'graphql-relay/lib/utils/base64';
import getRethink from 'server/database/rethinkDriver';
import {SlackIntegrationEdge} from 'server/graphql/models/SlackIntegration/slackIntegrationSchema';
// import getPubSub from 'server/utils/getPubSub';
import getPubSub from 'server/graphql/pubsub';
import {requireSUOrSelf, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import {errorObj} from 'server/utils/utils';
import shortid from 'shortid';
import {SLACK} from 'universal/utils/constants';

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
  type: new GraphQLNonNull(SlackIntegrationEdge),
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

    if (!provider) {
      throw errorObj({_error: `No token found for ${teamMemberId}`});
    }

    // see if the slackChannelId is legit
    const {accessToken} = provider;
    const channelInfoUrl = `https://slack.com/api/channels.info?token=${accessToken}&channel=${slackChannelId}`;
    const channelInfo = await fetch(channelInfoUrl);
    const channelInfoJson = await channelInfo.json();
    const {ok, channel} = channelInfoJson;
    if (!ok) {
      throw errorObj({_error: channelInfoJson.error});
    }

    const {is_archived: isArchived, name} = channel;
    if (isArchived) {
      throw errorObj({_error: `Slack channel ${name} is archived!`});
    }

    // RESOLUTION
    const node = await r.table('SlackIntegration').insert({
      id: shortid.generate(),
      blackList: [],
      isActive: true,
      channelId: slackChannelId,
      channelName: name,
      notifications: ['meeting:end', 'meeting:start'],
      teamId
    }, {returnChanges: true})('changes')(0)('new_val');
    const slackChannelAdded = {
      cursor: base64(node.id),
      node
    };
    getPubSub().publish(`slackChannelAdded.${teamId}`, {slackChannelAdded, mutatorId: socket.id});
    return slackChannelAdded;
  }
};

