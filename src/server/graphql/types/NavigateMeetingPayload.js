import {GraphQLObjectType} from 'graphql';
import {resolveMeeting} from 'server/graphql/resolvers';
import NewMeeting from 'server/graphql/types/NewMeeting';
import StandardMutationError from 'server/graphql/types/StandardMutationError';

const NavigateMeetingPayload = new GraphQLObjectType({
  name: 'NavigateMeetingPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    meeting: {
      type: NewMeeting,
      resolve: resolveMeeting
    }
  })
});

export default NavigateMeetingPayload;
