import {GraphQLID, GraphQLInterfaceType, GraphQLString} from 'graphql';
import TeamMember from 'server/graphql/types/TeamMember';
import getIsSoftTeamMember from 'universal/utils/getIsSoftTeamMember';
import SoftTeamMember from 'server/graphql/types/SoftTeamMember';

export const assigneeInterfaceFields = {
  id: {
    type: GraphQLID,
    description: 'THe teamMemberId or softTeamMemberId'
  },
  preferredName: {
    type: GraphQLString,
    description: 'The name of the assignee'
  },
  teamId: {
    type: GraphQLID,
    description: 'foreign key to Team table'
  }
};

const Assignee = new GraphQLInterfaceType({
  name: 'Assignee',
  fields: () => assigneeInterfaceFields,
  resolveType: (value) => getIsSoftTeamMember(value.assigneeId) ? SoftTeamMember : TeamMember
});

export default Assignee;
