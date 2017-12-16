import {GraphQLObjectType} from 'graphql';
import Team from 'server/graphql/types/Team';
import TeamMember from 'server/graphql/types/TeamMember';

const AddTeamPayload = new GraphQLObjectType({
  name: 'AddTeamPayload',
  fields: () => ({
    team: {
      type: Team
    },
    teamLead: {
      type: TeamMember,
      description: 'The teamMember that just created the new team'
    }
  })
});

export default AddTeamPayload;
