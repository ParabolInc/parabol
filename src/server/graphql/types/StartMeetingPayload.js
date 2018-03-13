import {GraphQLObjectType} from 'graphql';
import {resolveTeam} from 'server/graphql/resolvers';
import Team from 'server/graphql/types/Team';
import StandardMutationError from 'server/graphql/types/StandardMutationError';

const StartMeetingPayload = new GraphQLObjectType({
  name: 'StartMeetingPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    team: {
      type: Team,
      resolve: resolveTeam
    }
  })
});

export default StartMeetingPayload;
