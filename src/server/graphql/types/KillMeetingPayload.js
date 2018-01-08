import {GraphQLObjectType} from 'graphql';
import {resolveTeam} from 'server/graphql/resolvers';
import Team from 'server/graphql/types/Team';

const KillMeetingPayload = new GraphQLObjectType({
  name: 'KillMeetingPayload',
  fields: () => ({
    team: {
      type: Team,
      resolve: resolveTeam
    }
  })
});

export default KillMeetingPayload;
