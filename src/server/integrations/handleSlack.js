import fetch from 'node-fetch';
import {stringify} from 'querystring';
import getRethink from 'server/database/rethinkDriver';
import closeClientPage from 'server/utils/closeClientPage';
import postOptions from 'server/utils/fetchOptions';
import makeAppLink from 'server/utils/makeAppLink';
import {SLACK} from 'universal/utils/constants';
import handleIntegration from './handleIntegration';

export default function (exchange) {
  return async (req, res) => {
    closeClientPage(res);
    const {query: {code, state: teamMemberId}} = req;
    if (!code) return;
    const queryParams = {
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      code,
      redirect_uri: makeAppLink('auth/slack')
    };
    const uri = `https://slack.com/api/oauth.access?${stringify(queryParams)}`;
    const slackRes = await fetch(uri, postOptions);
    const json = await slackRes.json();
    // const {access_token: accessToken, team_name: slackTeamName, team_id: slackTeamId} = json;
    const {access_token: accessToken} = json;
    const userInfoUri = `https://slack.com/api/users.identity?token=${accessToken}`;
    const userInfoRes = await fetch(userInfoUri, postOptions);
    const userInfoJson = await userInfoRes.json();
    const {ok: infoOK, user} = userInfoJson;
    // meh screw being nice, they must've tampered with the oauth request if !ok. fail silently
    if (!infoOK) {
      console.log('bad info', userInfoJson);
      return;
    }
    const r = getRethink();
    const [userId, teamId] = teamMemberId;
    handleIntegration(accessToken, exchange, SLACK, teamMemberId, user.id);

    // add this guy to all the other existing integrations as long as he didn't blacklist himself & has permission
    const integrations = r.table('SlackIntegration')
      .getAll(teamId, {index: 'teamId'})
      .filter({isActive: true});

    const channelListUri = `https://slack.com/api/channels.list?token=${accessToken}&exclude_archive=1&exclude_members=1`;
    const channelListRes = await fetch(channelListUri);
    const channelListJson = channelListRes.json();
    const {ok: listOK, channels} = channelListJson;
    if (!listOK) {
      console.log('bad list', channelListJson);
      return;
    }

    integrations.forEach((integration) => {
      if (integration.blackList.includes(userId)) return;
      const channelInfo = channels.find((channel) => channel.id === integration.channelId);
      if (channelInfo && channelInfo.is_member) {
        r.table('SlackIntegration').get(integration.id)
          .update((doc) => ({
            userIds: doc('userIds').append(userId).distinct()
          }))
          .run();
      }
    });
  };
}
