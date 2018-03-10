import {GraphQLID, GraphQLObjectType} from 'graphql';
import Team from 'server/graphql/types/Team';
import TeamMember from 'server/graphql/types/TeamMember';
import User from 'server/graphql/types/User';
import {resolveUser} from 'server/graphql/resolvers';
import StandardMutationError from 'server/graphql/types/StandardMutationError';

const CreateFirstTeamPayload = new GraphQLObjectType({
  name: 'CreateFirstTeamPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    team: {
      type: Team
    },
    teamLead: {
      type: TeamMember
    },
    jwt: {
      type: GraphQLID,
      description: 'The new JWT after adding the team'
    },
    user: {
      type: User,
      resolve: resolveUser
    }
  })
});

export default CreateFirstTeamPayload;
