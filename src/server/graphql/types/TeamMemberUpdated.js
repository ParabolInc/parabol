import {GraphQLObjectType} from 'graphql';
import {resolveSub, resolveTeamMember} from 'server/graphql/resolvers';
import TeamMember from 'server/graphql/types/TeamMember';
import {UPDATED} from 'universal/utils/constants';

const TeamMemberUpdated = new GraphQLObjectType({
  name: 'TeamMemberUpdated',
  fields: () => ({
    teamMember: {
      type: TeamMember,
      resolve: resolveSub(UPDATED, resolveTeamMember)
    }
  })
});

export default TeamMemberUpdated;
