import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import TeamMember from './TeamMember'

const AddTeamMemberPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'AddTeamMemberPayload',
  fields: () => ({
    teamMember: {
      type: new GraphQLNonNull(TeamMember)
    }
  })
})

export default AddTeamMemberPayload
