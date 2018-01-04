import {GraphQLObjectType} from 'graphql';
import {resolveTeam} from 'server/graphql/resolvers';
import Team from 'server/graphql/types/Team';

const EndMeetingPayload = new GraphQLObjectType({
  name: 'EndMeetingPayload',
  fields: () => ({
    team: {
      type: Team,
      resolve: resolveTeam
    }
  })
});

export default EndMeetingPayload;
