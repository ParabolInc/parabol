import {GraphQLObjectType} from 'graphql';
import NewMeeting from 'server/graphql/types/NewMeeting';
import StandardMutationError from 'server/graphql/types/StandardMutationError';
import {resolveNewMeeting} from 'server/graphql/resolvers';

const NavigateMeetingPayload = new GraphQLObjectType({
  name: 'NavigateMeetingPayload',
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

export default NavigateMeetingPayload;
