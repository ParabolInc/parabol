import {GraphQLObjectType} from 'graphql';
import Team from 'server/graphql/types/Team';
import {resolveTeam} from 'server/graphql/resolvers';
import StandardMutationError from 'server/graphql/types/StandardMutationError';

const UpdateCheckInQuestionPayload = new GraphQLObjectType({
  name: 'UpdateCheckInQuestionPayload',
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

export default UpdateCheckInQuestionPayload;
