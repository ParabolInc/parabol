import {GraphQLObjectType} from 'graphql';
import RetrospectiveMeeting from 'server/graphql/types/RetrospectiveMeeting';
import {resolveNewMeeting} from 'server/graphql/resolvers';

const VotePhaseCompletePayload = new GraphQLObjectType({
  name: 'VotePhaseCompletePayload',
  fields: () => ({
    meeting: {
      type: RetrospectiveMeeting,
      description: 'the current meeting',
      resolve: resolveNewMeeting
    }
  })
});

export default VotePhaseCompletePayload;
