import {GraphQLObjectType} from 'graphql';
import {resolveTeam} from 'server/graphql/resolvers';
import Team from 'server/graphql/types/Team';

const UpdateMeetingPayload = new GraphQLObjectType({
  name: 'UpdateMeetingPayload',
  fields: () => ({
    team: {
      type: Team,
      resolve: resolveTeam
    }
  })
});

export default UpdateMeetingPayload;
