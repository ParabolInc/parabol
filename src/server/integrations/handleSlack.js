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
    console.log('queryParams', JSON.stringify(queryParams));
    const uri = `https://slack.com/api/oauth.access?${stringify(queryParams)}`;
    console.log('uri', uri);
    const slackRes = await fetch(uri, postOptions);
    console.log('slack res', slackRes);
    const json = await slackRes.json();
    console.log('json', json);
    // const {access_token: accessToken, team_name: slackTeamName, team_id: slackTeamId} = json;
    const {access_token: accessToken} = json;
    console.log('calling HI', accessToken);
    handleIntegration(accessToken, exchange, service, state);
  };
}
