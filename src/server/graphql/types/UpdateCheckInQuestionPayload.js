import {GraphQLObjectType} from 'graphql';
import {Team} from 'server/graphql/models/Team/teamSchema';

const UpdateCheckInQuestionPayload = new GraphQLObjectType({
  name: 'UpdateCheckInQuestionPayload',
  fields: () => ({
    team: {
      type: Team
    }
  })
});

export default UpdateCheckInQuestionPayload;
