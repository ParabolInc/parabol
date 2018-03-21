import {GraphQLObjectType} from 'graphql';
import {resolveMeetingMember} from 'server/graphql/resolvers';
import StandardMutationError from 'server/graphql/types/StandardMutationError';
import MeetingMember from 'server/graphql/types/MeetingMember';

const NewMeetingCheckInPayload = new GraphQLObjectType({
  name: 'NewMeetingCheckInPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    meetingMember: {
      type: MeetingMember,
      resolve: resolveMeetingMember
    }
  })
});

export default NewMeetingCheckInPayload;
