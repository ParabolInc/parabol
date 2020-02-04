import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import TeamMember from './TeamMember'

const UpdateTeamMemberPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdateTeamMemberPayload',
  fields: () => ({
    teamMember: {
      type: new GraphQLNonNull(TeamMember)
    }
  })
})

export default UpdateTeamMemberPayload
