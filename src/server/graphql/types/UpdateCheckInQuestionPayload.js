import {GraphQLObjectType} from 'graphql';
import Team from 'server/graphql/types/Team';

const UpdateCheckInQuestionPayload = new GraphQLObjectType({
  name: 'UpdateCheckInQuestionPayload',
  fields: () => ({
    team: {
      type: Team
    }
  })
});

export default UpdateCheckInQuestionPayload;
