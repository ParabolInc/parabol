import { GraphQLNonNull, GraphQLID } from 'graphql';
import { Meeting } from './meetingSchema';
import { errorObj } from '../utils';
import { getMeetingById } from './helpers';

export default {
  getMeetingById: {
    type: Meeting,
    args: {
      meetingId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The ID for the desired Meeting'
      }
    },
    async resolve(source, {meetingId}) {
      const meeting = await getMeetingById(meetingId);
      if (!meeting) {
        throw errorObj({_error: 'Meeting not found'});
      }
      return meeting;
    }
  }
};
