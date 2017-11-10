import {GraphQLNonNull, GraphQLObjectType} from 'graphql';
import {Team} from 'server/graphql/models/Team/teamSchema';

const UpdateMeetingPayload = new GraphQLObjectType({
  name: 'UpdateMeetingPayload',
  fields: () => ({
    team: {
      type: new GraphQLNonNull(Team)
    }
  })
});

export default UpdateMeetingPayload;
