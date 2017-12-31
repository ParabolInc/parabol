import {GraphQLObjectType} from 'graphql';
import {resolveTeam} from 'server/graphql/resolvers';
import Team from 'server/graphql/types/Team';

const TeamUpdated = new GraphQLObjectType({
  name: 'TeamUpdated',
  fields: () => ({
    team: {
      type: Team,
      resolve: resolveTeam
    }
  })
});

export default TeamUpdated;
