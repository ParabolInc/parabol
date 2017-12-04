import {GraphQLNonNull, GraphQLObjectType} from 'graphql';
import Team from 'server/graphql/types/Team';

const UpdateMeetingPayload = new GraphQLObjectType({
  name: 'UpdateMeetingPayload',
  fields: () => ({
    team: {
      type: new GraphQLNonNull(Team)
    }
  })
});

export default UpdateMeetingPayload;
