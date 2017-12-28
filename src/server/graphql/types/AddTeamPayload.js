import {GraphQLObjectType} from 'graphql';
import {resolveTeam, resolveTeamMember} from 'server/graphql/resolvers';
import Team from 'server/graphql/types/Team';
import TeamMember from 'server/graphql/types/TeamMember';

const AddTeamPayload = new GraphQLObjectType({
  name: 'AddTeamPayload',
  fields: () => ({
    team: {
      type: Team,
      resolve: resolveTeam
    },
    teamMember: {
      type: TeamMember,
      description: 'The teamMember that just created the new team, if this is a creation',
      resolve: resolveTeamMember
    }
  })
});

export default AddTeamPayload;
