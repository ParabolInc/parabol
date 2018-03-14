import {GraphQLObjectType} from 'graphql';
import {resolveMeeting, resolveTeam} from 'server/graphql/resolvers';
import Team from 'server/graphql/types/Team';
import NewMeeting from 'server/graphql/types/NewMeeting';
import StandardMutationError from 'server/graphql/types/StandardMutationError';

const StartNewMeetingPayload = new GraphQLObjectType({
  name: 'StartNewMeetingPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    team: {
      type: Team,
      resolve: resolveTeam
    },
    meeting: {
      type: NewMeeting,
      resolve: resolveMeeting
    }
  })
});

export default StartNewMeetingPayload;
