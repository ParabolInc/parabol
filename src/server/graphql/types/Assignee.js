import {GraphQLID, GraphQLInterfaceType, GraphQLString} from 'graphql';
import GraphQLEmailType from 'server/graphql/types/GraphQLEmailType';
import Invitation from 'server/graphql/types/Invitation';
import OrgApproval from 'server/graphql/types/OrgApproval';
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
  }
};

const Assignee = new GraphQLInterfaceType({
  name: 'Assignee',
  fields: () => assigneeInterfaceFields,
  resolveType: (value) => getIsSoftTeamMember(value.assigneeId) ? SoftTeamMember : TeamMember
});

export default Assignee;
