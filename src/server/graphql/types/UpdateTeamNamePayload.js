import {GraphQLObjectType} from 'graphql';
import Team from 'server/graphql/types/Team';
import {resolveTeam} from 'server/graphql/resolvers';
import StandardMutationError from 'server/graphql/types/StandardMutationError';

const UpdateTeamNamePayload = new GraphQLObjectType({
  name: 'UpdateTeamNamePayload',
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

export default UpdateTeamNamePayload;
