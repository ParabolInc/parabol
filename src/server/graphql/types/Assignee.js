import {GraphQLID, GraphQLInterfaceType, GraphQLString, GraphQLNonNull} from 'graphql'
import TeamMember from 'server/graphql/types/TeamMember'
import getIsSoftTeamMember from 'universal/utils/getIsSoftTeamMember'
import SoftTeamMember from 'server/graphql/types/SoftTeamMember'

export const assigneeInterfaceFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'The teamMemberId or softTeamMemberId'
  },
  preferredName: {
    type: new GraphQLNonNull(GraphQLString),
    description: 'The name of the assignee'
  },
  teamId: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'foreign key to Team table'
  }
})

const Assignee = new GraphQLInterfaceType({
  name: 'Assignee',
  fields: assigneeInterfaceFields,
  resolveType: (value) => (getIsSoftTeamMember(value.id) ? SoftTeamMember : TeamMember)
})

export default Assignee
