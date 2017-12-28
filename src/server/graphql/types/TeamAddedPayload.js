import {GraphQLObjectType} from 'graphql';
import {resolveNotification, resolveTeam, resolveTeamMember} from 'server/graphql/resolvers';
import NotifyAddedToTeam from 'server/graphql/types/NotifyAddedToTeam';
import Team from 'server/graphql/types/Team';
import TeamMember from 'server/graphql/types/TeamMember';

const TeamAddedPayload = new GraphQLObjectType({
  name: 'TeamAddedPayload',
  fields: () => ({
    team: {
      type: Team,
      resolve: resolveTeam
    },
    teamMember: {
      type: TeamMember,
      description: 'The teamMember that just created the new team, if this is a creation',
      resolve: resolveTeamMember
    },
    notification: {
      type: NotifyAddedToTeam,
      description: 'The notification that you were just added, if this is a reactivation or acceptance',
      resolve: resolveNotification
    }
  })
});

export default TeamAddedPayload;
