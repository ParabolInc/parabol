import closeClientPage from 'server/utils/closeClientPage';
import fetch from 'node-fetch';
import {stringify} from 'querystring';
// import Queue from 'server/utils/bull';
import postOptions from 'server/utils/fetchOptions';
import handleIntegration from './handleIntegration';

export default function (exchange) {
  return async (req, res) => {
    closeClientPage(res);
    const {query: {code, state}} = req;
    if (!code) return;
    const service = 'slack';
    const queryParams = {
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      code
    };
    const uri = `https://slack.com/api/oauth.access?${stringify(queryParams)}`;
    const slackRes = await fetch(uri, postOptions);
    const json = await slackRes.json();
    // const {access_token: accessToken, team_name: slackTeamName, team_id: slackTeamId} = json;
    const {access_token: accessToken} = json;
    handleIntegration(accessToken, exchange, service, state);
  };
}
