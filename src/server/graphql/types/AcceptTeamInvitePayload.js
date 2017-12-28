import {GraphQLID, GraphQLObjectType} from 'graphql';
import {resolveTeam, resolveTeamMember} from 'server/graphql/resolvers';
import Team from 'server/graphql/types/Team';
import TeamMember from 'server/graphql/types/TeamMember';

const AcceptTeamInvitePayload = new GraphQLObjectType({
  name: 'AcceptTeamInvitePayload',
  fields: () => ({
    team: {
      type: Team,
      description: 'Thea team that the invitee will be joining',
      resolve: resolveTeam
    },
    authToken: {
      type: GraphQLID,
      description: 'The new JWT'
    },
    teamMember: {
      type: TeamMember,
      description: 'The new team member on the team',
      resolve: resolveTeamMember
    }
  })
});

export default AcceptTeamInvitePayload;
