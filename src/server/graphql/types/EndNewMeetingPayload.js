import {GraphQLBoolean, GraphQLObjectType} from 'graphql';
import {resolveNewMeeting, resolveTeam} from 'server/graphql/resolvers';
import Team from 'server/graphql/types/Team';
import StandardMutationError from 'server/graphql/types/StandardMutationError';
import NewMeeting from 'server/graphql/types/NewMeeting';

const EndNewMeetingPayload = new GraphQLObjectType({
  name: 'EndNewMeetingPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    isKill: {
      type: GraphQLBoolean,
      description: 'true if the meeting was killed (ended before reaching last stage)'
    },
    team: {
      type: Team,
      resolve: resolveTeam
    },
    meeting: {
      type: NewMeeting,
      resolve: resolveNewMeeting
    }
  })
});

export default EndNewMeetingPayload;
