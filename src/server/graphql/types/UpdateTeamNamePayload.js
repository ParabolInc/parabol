import {GraphQLObjectType} from 'graphql';
import Team from 'server/graphql/types/Team';

const UpdateTeamNamePayload = new GraphQLObjectType({
  name: 'UpdateTeamNamePayload',
  fields: () => ({
    team: {
      type: Team
    }
  })
});

export default UpdateTeamNamePayload;
