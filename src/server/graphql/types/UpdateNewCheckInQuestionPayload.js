import {GraphQLObjectType} from 'graphql';
import {resolveNewMeeting} from 'server/graphql/resolvers';
import StandardMutationError from 'server/graphql/types/StandardMutationError';
import NewMeeting from 'server/graphql/types/NewMeeting';

const UpdateNewCheckInQuestionPayload = new GraphQLObjectType({
  name: 'UpdateNewCheckInQuestionPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    meeting: {
      type: NewMeeting,
      resolve: resolveNewMeeting
    }
  })
});

export default UpdateNewCheckInQuestionPayload;
