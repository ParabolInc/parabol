import {GraphQLNonNull, GraphQLObjectType} from 'graphql';
import TeamMember from 'server/graphql/types/TeamMember';

const UpdateTeamMemberPayload = new GraphQLObjectType({
  name: 'UpdateTeamMemberPayload',
  fields: () => ({
    teamMember: {
      type: new GraphQLNonNull(TeamMember)
    }
  })
});

export default UpdateTeamMemberPayload;
