import {GraphQLObjectType} from 'graphql';
import Team from 'server/graphql/types/Team';

const UpdateTeamPayload = new GraphQLObjectType({
  name: 'UpdateTeamPayload',
  fields: () => ({
    team: {
      type: Team
    }
  })
});

export default UpdateTeamPayload;
