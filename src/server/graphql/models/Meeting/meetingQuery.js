import {GraphQLNonNull, GraphQLID} from 'graphql';
import Meeting from './meetingSchema';
import {errorObj} from 'server/utils/utils';
import getRethink from 'server/database/rethinkDriver';
import {requireAuth, requireSUOrTeamMember} from 'server/utils/authorization';

export default {
  getMeetingById: {
    type: Meeting,
    description: 'A query for a team\'s meeting',
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The meeting ID'
      }
    },
    async resolve(source, {id}, {authToken}) {
      const r = getRethink();
      requireAuth(authToken);
      const meeting = await r.table('Meeting').get(id);
      if (!meeting) {
        throw errorObj({_error: 'Meeting ID not found'});
      }
      requireSUOrTeamMember(authToken, meeting.teamId);
      return meeting;
    }
  }
};
