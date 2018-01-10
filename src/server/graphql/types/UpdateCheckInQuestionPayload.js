import {GraphQLObjectType} from 'graphql';
import Team from 'server/graphql/types/Team';
import {resolveTeam} from 'server/graphql/resolvers';

const UpdateCheckInQuestionPayload = new GraphQLObjectType({
  name: 'UpdateCheckInQuestionPayload',
  fields: () => ({
    team: {
      type: Team,
      resolve: resolveTeam
    }
  })
});

export default UpdateCheckInQuestionPayload;
