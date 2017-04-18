import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID,
} from 'graphql';
import {requireSUOrSelf, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import {SLACK} from 'universal/utils/constants';
import queryIntegrator from 'server/utils/queryIntegrator';
import {errorObj} from 'server/utils/utils';
import {handleRethinkAdd} from "../../../../utils/makeChangefeedHandler";

export default {
  type: GraphQLBoolean,
  description: 'Remove an integration from a team',
  args: {
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the teamMember calling it.'
    },
    slackChannelId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the slack channel that wants our messages'
    }
  },
  async resolve(source, {teamMemberId, slackChannelId}, {authToken, exchange, socket}) {
    // AUTH
    const [userId, teamId] = teamMemberId.split('::');
    requireSUOrSelf(authToken, userId);
    requireSUOrTeamMember(authToken, teamId);
    requireWebsocket(socket);


    // VALIDATION
    const token = await queryIntegrator({
      action: 'getToken',
      payload: {
        service: SLACK,
        teamMemberId
      }
    });
    if (!token) {
      throw errorObj({_error: `No token found for ${teamMemberId}`});
    }

    const channelInfo = await fetch(`https://slack.com/api/channels.info?token=${token}&channel=${slackChannelId}`);
    const channelInfoJson = await channelInfo.json();
    if (!channelInfoJson.ok) {
      throw errorObj({_error: channelInfoJson.error})
    }

    // RESOLUTION
    const {data, errors} = await queryIntegrator({
      action: 'addSlackChannel',
      payload: {
        slackChannelId,
        teamMemberId
      }
    });
    if (errors) {
      throw errorObj({_error: errors[0]});
    }

    // notify all the listeners that a mutation occurred
    const channel = `integrations/${teamMemberId}`;
    const payload = handleRethinkAdd(data);
    exchange.publish(channel, {excludeSocket: socket.id, payload});
    return true;
  }
}
