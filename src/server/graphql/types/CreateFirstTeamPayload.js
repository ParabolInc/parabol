import {GraphQLID, GraphQLObjectType} from 'graphql';
import Team from 'server/graphql/types/Team';
import TeamMember from 'server/graphql/types/TeamMember';
import User from 'server/graphql/types/User';
import {resolveUser} from 'server/graphql/resolvers';

const CreateFirstTeamPayload = new GraphQLObjectType({
  name: 'CreateFirstTeamPayload',
  fields: () => ({
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
