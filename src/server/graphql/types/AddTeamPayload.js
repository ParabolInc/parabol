import {GraphQLObjectType} from 'graphql';
import NotifyAddedToTeam from 'server/graphql/types/NotifyAddedToTeam';
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
      description: 'The teamMember that just created the new team, if this is a creation'
    },
    notification: {
      type: NotifyAddedToTeam,
      description: 'The notification that you were just added, if this is a reactivation or acceptance'
    }
  })
});

export default AddTeamPayload;
