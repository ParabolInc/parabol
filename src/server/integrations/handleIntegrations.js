import fetch from 'node-fetch';
import * as querystring from 'querystring';
import Queue from 'server/utils/bull';

const integratorQueue = Queue('integrator');
export default function (exchange) {
  return async (req, res) => {
    // close the oauth popup window. i'm just winging this. seems to work.
    const autoClose = `<!DOCTYPE html>
    <html>
    <head>
    <script>
      (window.close())()
    </script>
    </head>
    </html>
    `;
    res.send(autoClose);
    const {params: {service}, query: {code, state}} = req;
    const fetchOptions = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    };
    const queryParams = {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      state
    };
    const uri = `https://github.com/login/oauth/access_token?${querystring.stringify(queryParams)}`;
    const ghRes = await fetch(uri, fetchOptions);
    const {access_token: accessToken} = await ghRes.json();
    const teamMemberId = state;
    const [userId] = teamMemberId.split('::');
    const channel = `integrations/${teamMemberId}`;

    // write to the DB on the microservice
    integratorQueue.add({
      action: 'setToken',
      channel,
      payload: {
        accessToken,
        teamMemberId
      },
      service
    });

    // tell the subs that something new has arrived
    exchange.publish(channel, {
      type: 'add',
      fields: {
        id: accessToken,
        service: 'github',
        userId
      }
    });
  };
}
