import {GraphQLObjectType} from 'graphql';
import {resolveTeamMember} from 'server/graphql/resolvers';
import TeamMember from 'server/graphql/types/TeamMember';

const TeamMemberUpdated = new GraphQLObjectType({
  name: 'TeamMemberUpdated',
  fields: () => ({
    teamMember: {
      type: TeamMember,
      resolve: resolveTeamMember
    }
  })
});

export default TeamMemberUpdated;
