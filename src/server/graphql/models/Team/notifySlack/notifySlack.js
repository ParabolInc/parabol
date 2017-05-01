import getRethink from 'server/database/rethinkDriver';
import queryIntegrator from '../../../../utils/queryIntegrator';
import makeAppLink from '../../../../utils/makeAppLink';

const notifySlack = (text, teamId) => {
  queryIntegrator({
    action: 'notifySlack',
    payload: {
      text,
      teamId
    }
  });
};

export const startSlackMeeting = async (teamId) => {
  const r = getRethink();
  const team = await r.table('Team').get(teamId);
  const meetingUrl = makeAppLink(`meeting/${teamId}`);
  const slackText = `${team.name} has started a meeting!\n To join, click here: ${meetingUrl}`;
  notifySlack(slackText, teamId);
};

export const endSlackMeeting = async (meetingId, teamId) => {
  const r = getRethink();
  const team = await r.table('Team').get(teamId);
  const summaryUrl = makeAppLink(`summary/${meetingId}`);
  const slackText = `The meeting for ${team.name} has ended!\n Check out the summary here: ${summaryUrl}`;
  notifySlack(slackText, teamId);
};
