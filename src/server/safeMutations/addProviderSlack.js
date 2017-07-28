import fetch from 'node-fetch';
import {stringify} from 'querystring';
import getRethink from 'server/database/rethinkDriver';
import getProviderRowData from 'server/safeQueries/getProviderRowData';
import postOptions from 'server/utils/fetchOptions';
import getPubSub from 'server/utils/getPubSub';
import makeAppLink from 'server/utils/makeAppLink';
import shortid from 'shortid';
import {SLACK, SLACK_SCOPE} from 'universal/utils/constants';
import insertSlackChannel from 'server/safeMutations/insertSlackChannel';

const addProviderSlack = async (code, teamId, userId) => {
  const r = getRethink();
  const now = new Date();
  const queryParams = {
    client_id: process.env.SLACK_CLIENT_ID,
    client_secret: process.env.SLACK_CLIENT_SECRET,
    code,
    redirect_uri: makeAppLink('auth/slack')
  };
  const uri = `https://slack.com/api/oauth.access?${stringify(queryParams)}`;
  const slackRes = await fetch(uri, postOptions);
  const json = await slackRes.json();
  const {ok,
    error,
    access_token: accessToken,
    scope,
    team_id: providerUserId,
    team_name: providerUserName,
    incoming_webhook: firstChannel
  } = json;
  if (!ok) {
    throw new Error(error);
  }
  if (scope !== SLACK_SCOPE) {
    throw new Error(`bad scope: ${scope}`);
  }
  const provider = await r.table('Provider')
    .getAll(teamId, {index: 'teamIds'})
    .filter({service: SLACK})
    .nth(0)('id')
    .default(null)
    .do((providerId) => {
      return r.branch(
        providerId.eq(null),
        r.table('Provider')
          .insert({
            id: shortid.generate(),
            accessToken,
            createdAt: now,
            providerUserId,
            providerUserName,
            service: SLACK,
            teamIds: [teamId],
            updatedAt: now,
            userId
          }, {returnChanges: true})('changes')(0)('new_val'),
        r.table('Provider')
          .get(providerId)
          .update({
            accessToken,
            updatedAt: now
          }, {returnChanges: true})('changes')(0)('new_val')
      );
    });

  // need to fetch this because it could be a refresh
  const rowDetails = await getProviderRowData(SLACK, teamId);

  const providerAdded = {
    provider,
    providerRow: {
      ...rowDetails,
      accessToken,
      service: SLACK,
      // tell relay to not automatically merge the new value as a sink
      teamId: `_${teamId}`
    }
  };
  getPubSub().publish(`providerAdded.${teamId}`, {providerAdded});

  // add the first channel
  if (firstChannel) {
    const {channel, channel_id: channelId} = firstChannel;
    const channelName = channel.substring(1);
    const newChannel = await insertSlackChannel(channelId, channelName, teamId);
    const slackChannelAdded = {
      channel: newChannel
    };
    getPubSub().publish(`slackChannelAdded.${teamId}`, {slackChannelAdded});
  }
};

export default addProviderSlack;
