import fetch from 'node-fetch';
import {stringify} from 'querystring';
import Queue from 'server/utils/bull';

const fetchOptions = {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
};

const integratorQueue = Queue('integrator');
export default {
  github: async(query, exchange) => {
    const {code, state} = query;
    const service = 'github';
    const queryParams = {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      state
    };
    const uri = `https://github.com/login/oauth/access_token?${stringify(queryParams)}`;
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
        service,
        userId
      }
    });
  },
  slack: async(query, exchange) => {
    const {code, state} = query;
    const service = 'slack';
    const queryParams = {
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      code,
    };
    const uri = `https://slack.com/api/oauth.access?${stringify(queryParams)}`;
    const slackRes = await fetch(uri, fetchOptions);
    const {access_token: accessToken, team_name: teamName, team_id: teamId ,incoming_webhook: webhook, bot} = await slackRes.json();
    const teamMemberId = state;
    const [userId] = teamMemberId.split('::');
    const channel = `integrations/${teamMemberId}`;

    integratorQueue.add({
      action: 'setToken',
      channel,
      payload: {
        accessToken,
        teamMemberId
      },
      service
    });

    exchange.publish(channel, {
      type: 'add',
      fields: {
        id: accessToken,
        service,
        userId
      }
    });
  }
}
