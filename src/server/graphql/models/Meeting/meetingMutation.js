import getRethink from 'server/database/rethinkDriver';
import {requireSUOrTeamMember, requireWebsocket} from '../authorization';
import {Meeting} from './meetingSchema';
import sendEmailSummary from './helpers/sendEmailSummary';

import {
  GraphQLNonNull,
  GraphQLID
} from 'graphql';

export default {
  summarizeMeeting: {
    type: Meeting,
    description: 'Try to send a meeting email summary & return the guts of that email',
    args: {
      meetingId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique meeting ID that we want to summarize'
      }
    },
    async resolve(source, {meetingId}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      requireWebsocket(socket);
      const meeting = await r.table('Meeting').get(meetingId).default({})
        .do((res) => {
          return res.merge({
            invitees: res('invitees').default([])
              .map((invitee) => {
                const teamMember = r.table('TeamMember').get(invitee('id'));
                return invitee.merge({
                  picture: teamMember('picture'),
                  preferredName: teamMember('preferredName'),
                  actions: res('actions').filter({teamMemberId: invitee('id')}),
                  projects: res('projects').filter({teamMemberId: invitee('id')})
                });
              })
          });
        });
      const {teamId} = meeting;
      // perform the query before the check because 99.9% of attempts will be honest & that will save us a query
      requireSUOrTeamMember(authToken, teamId);

      // RESOLUTION
      const teamMemberId = `${authToken.sub}::${teamId}`;
      // call async function and don't worry about waiting
      sendEmailSummary(meeting, teamMemberId);
      return meeting;
    }
  }
};
