import {GraphQLObjectType} from 'graphql';
import {resolveTeam} from 'server/graphql/resolvers';
import Team from 'server/graphql/types/Team';

const MeetingUpdated = new GraphQLObjectType({
  name: 'MeetingUpdated',
  fields: () => ({
    team: {
      type: Team,
      resolve: resolveTeam
    }
  })
});

export default MeetingUpdated;
