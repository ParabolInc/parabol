import {GraphQLObjectType} from 'graphql';
import Team from 'server/graphql/types/Team';
import {resolveTeam} from 'server/graphql/resolvers';

const UpdateTeamNamePayload = new GraphQLObjectType({
  name: 'UpdateTeamNamePayload',
  fields: () => ({
    team: {
      type: Team,
      resolve: resolveTeam
    }
  })
});

export default UpdateTeamNamePayload;
