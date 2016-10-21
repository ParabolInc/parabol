import getRethink from 'server/database/rethinkDriver';
import {getUserId, requireAuth, requireSUOrTeamMember, requireWebsocket} from '../authorization';
import {updatedOrOriginal, errorObj} from '../utils';
import {Meeting} from './meetingSchema';

import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID,
  GraphQLString,
  GraphQLInt
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

      const meeting = await r.table('Meeting').get(meetingId);
      const {teamId, summarySentAt} = meeting;
      requireSUOrTeamMember(authToken, teamId);

      if (!summarySentAt) {
        // send the summary email

      }
    }
  }
}
