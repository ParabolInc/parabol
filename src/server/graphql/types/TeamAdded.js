import {GraphQLObjectType} from 'graphql';
import {resolveNotification, resolveSub, resolveTeam, resolveTeamMember} from 'server/graphql/resolvers';
import NotifyAddedToTeam from 'server/graphql/types/NotifyAddedToTeam';
import Team from 'server/graphql/types/Team';
import TeamMember from 'server/graphql/types/TeamMember';
import {ADDED} from 'universal/utils/constants';

const TeamAdded = new GraphQLObjectType({
  name: 'TeamAdded',
  fields: () => ({
    notification: {
      type: NotifyAddedToTeam,
      description: 'The notification that you were just added, if this is a reactivation or acceptance',
      resolve: resolveNotification
    },
    team: {
      type: Team,
      resolve: resolveSub(ADDED, resolveTeam)
    },
    teamMember: {
      type: TeamMember,
      description: 'The teamMember that just created the new team, if this is a creation',
      resolve: resolveTeamMember
    }
  })
});

export default TeamAdded;
