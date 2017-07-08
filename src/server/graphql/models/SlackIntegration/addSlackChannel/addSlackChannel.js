import {GraphQLID, GraphQLNonNull} from 'graphql';
import {mutationWithClientMutationId} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';
import {SlackIntegrationEdge} from 'server/graphql/models/SlackIntegration/slackIntegrationSchema';
import {requireSUOrSelf, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import {errorObj} from 'server/utils/utils';
import shortid from 'shortid';
import {SLACK} from 'universal/utils/constants';
//import getPubSub from 'server/utils/getPubSub';
import getPubSub from 'server/graphql/pubsub';

export default mutationWithClientMutationId({
  name: 'AddSlackChannel',
  inputFields: {
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the teamMember calling it.'
    },
    slackChannelId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the slack channel that wants our messages'
    }
  },
  outputFields: {
    newChannel: {
      type: SlackIntegrationEdge,
      description: 'Add a slack channel where messages will be sent',
      resolve: (node) => {
        return {
          node
        };
      }
    }
  },
  mutateAndGetPayload: async ({teamMemberId, slackChannelId}, {authToken, exchange, socket}) => {
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
    const res = await r.table('SlackIntegration').insert({
      id: shortid.generate(),
      blackList: [],
      isActive: true,
      channelId: slackChannelId,
      channelName: name,
      notifications: ['meeting:end', 'meeting:start'],
      teamId
    }, {returnChanges: true})('changes')(0)('new_val');
    getPubSub().publish(`slackChannelAdded.${teamId}`, {slackChannelAdded: {node: res}, mutatorId: socket.id});
    return res;
  }
});

