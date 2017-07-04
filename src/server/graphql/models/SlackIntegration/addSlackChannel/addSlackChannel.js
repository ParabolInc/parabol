import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID
} from 'graphql';
import {requireSUOrSelf, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import {SLACK} from 'universal/utils/constants';
import {errorObj} from 'server/utils/utils';
import getRethink from 'server/database/rethinkDriver';
import shortid from 'shortid';

export default {
  type: GraphQLBoolean,
  description: 'Add a slack channel where messages will be sent',
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
      .filter({service: SLACK, userId})
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

    const {is_member: isMember, is_archived: isArchived, name} = channel;
    if (!isMember) {
      throw errorObj({_error: `You are not a member of slack channel ${name}`});
    }
    if (isArchived) {
      throw errorObj({_error: `Slack channel ${name} is archived!`});
    }

    // RESOLUTION

    // find all other team members that can access the channel
    //const userIds = r.table('Provider')
    //  .getAll(r.args(members), {index: 'providerUserId'})('userId');

    // for each existing provider, add their userId to the userIds
    //await r.table('SlackIntegration').insert({
    //  id: shortid.generate(),
    //  blackList: [],
    //  isActive: true,
    //  channelId: slackChannelId,
    //  channelName: name,
    //  notifications: ['meeting:end', 'meeting:start'],
    //  teamId,
    //  userIds
    //});
    return true;
  }
};

