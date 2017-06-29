import closeClientPage from 'server/utils/closeClientPage';
import fetch from 'node-fetch';
import {stringify} from 'querystring';
import postOptions from 'server/utils/fetchOptions';
import handleIntegration from './handleIntegration';
import makeAppLink from 'server/utils/makeAppLink';
import {SLACK} from 'universal/utils/constants';

export default function (exchange) {
  return async (req, res) => {
    closeClientPage(res);
    const {query: {code, state}} = req;
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
    const {ok, user} = userInfoJson;
    // meh screw being nice, they must've tampered with the oauth request if !ok. fail silently
    if (ok) {
      handleIntegration(accessToken, exchange, SLACK, state, user.id);
    }
  };
}
