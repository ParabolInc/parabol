import {GraphQLObjectType} from 'graphql';
import {resolveSub, resolveTeam} from 'server/graphql/resolvers';
import Team from 'server/graphql/types/Team';
import {UPDATED} from 'universal/utils/constants';

const TeamUpdated = new GraphQLObjectType({
  name: 'TeamUpdated',
  fields: () => ({
    team: {
      type: Team,
      resolve: resolveSub(UPDATED, resolveTeam)
    }
  })
});

export default TeamUpdated;
