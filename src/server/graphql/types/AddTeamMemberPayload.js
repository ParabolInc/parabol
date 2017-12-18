import {GraphQLNonNull, GraphQLObjectType} from 'graphql';
import TeamMember from 'server/graphql/types/TeamMember';

const AddTeamMemberPayload = new GraphQLObjectType({
  name: 'AddTeamMemberPayload',
  fields: () => ({
    teamMember: {
      type: new GraphQLNonNull(TeamMember)
    }
  })
});

export default AddTeamMemberPayload;
