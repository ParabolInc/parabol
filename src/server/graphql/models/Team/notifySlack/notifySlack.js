import getRethink from 'server/database/rethinkDriver';
import {SLACK} from 'universal/utils/constants';
import makeAppLink from '../../../../utils/makeAppLink';

const getIntegrationsForNotification = (teamId, notification) => {
  const r = getRethink();
  return r.table('SlackIntegration')
    .getAll(teamId, {index: 'teamId'})
    .filter({isActive: true})
    .filter((integration) => integration('notifications').contains(notification));
};

/* eslint-disable no-await-in-loop */
const notifySlack = async (integrations, teamId, slackText) => {
  const r = getRethink();
  const provider = await r.table('Provider')
    .getAll(teamId, {index: 'teamIds'})
    .filter({service: SLACK})
    .nth(0);
  // for each slack channel, send a notification
  for (let i = 0; i < integrations.length; i++) {
    const integration = integrations[i];
    const {channelId} = integration;
    const {accessToken} = provider;
    const uri = `https://slack.com/api/chat.postMessage?token=${accessToken}&channel=${channelId}&text=${slackText}&unfurl_links=true`;
    const res = await fetch(uri);
    const resJson = await res.json();
    const {error} = resJson;
    if (error === 'channel_not_found') {
      await r.table('SlackIntegration').get(integration.id)
        .update({
          isActive: false
        });
      // break for no success
    } else if (error === 'not_in_channel' || error === 'invalid_auth') {
      console.log('ERRRR', error);
    }
  }
};

/* eslint-enable */

export const startSlackMeeting = async (teamId) => {
  const r = getRethink();

  // get all slack channels that care about meeting:start
  const integrations = await getIntegrationsForNotification(teamId, 'meeting:start');
  if (integrations.length === 0) return;

  const team = await r.table('Team').get(teamId);
  const meetingUrl = makeAppLink(`meeting/${teamId}`);
  const slackText = `${team.name} has started a meeting!\n To join, click here: ${meetingUrl}`;
  notifySlack(integrations, teamId, slackText);
};

export const endSlackMeeting = async (meetingId, teamId) => {
  const r = getRethink();

  const integrations = await getIntegrationsForNotification(teamId, 'meeting:end');
  if (integrations.length === 0) return;

  const team = await r.table('Team').get(teamId);
  const summaryUrl = makeAppLink(`summary/${meetingId}`);
  const slackText = `The meeting for ${team.name} has ended!\n Check out the summary here: ${summaryUrl}`;
  notifySlack(integrations, teamId, slackText);
};
