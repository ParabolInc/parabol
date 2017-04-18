import closeClientPage from 'server/utils/closeClientPage';
import fetch from 'node-fetch';
import {stringify} from 'querystring';
import {postOptions} from 'server/utils/fetchOptions';
import handleIntegration from './handleIntegration';

export default function (exchange) {
  return async (req, res) => {
    // close the oauth popup window. i'm just winging this. seems to work.
    closeClientPage(res);
    const {query: {code, state}} = req;
    const service = 'github';
    const queryParams = {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      state
    };
    const uri = `https://github.com/login/oauth/access_token?${stringify(queryParams)}`;
    const ghRes = await fetch(uri, postOptions);
    const {access_token: accessToken} = await ghRes.json();

    handleIntegration(accessToken, exchange, service, state);
  };
}
