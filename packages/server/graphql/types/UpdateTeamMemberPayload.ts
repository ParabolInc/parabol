import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import TeamMember from './TeamMember'
import {GQLContext} from '../graphql'

const UpdateTeamMemberPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdateTeamMemberPayload',
  fields: () => ({
    teamMember: {
      type: new GraphQLNonNull(TeamMember)
    }
  })
})

export default UpdateTeamMemberPayload
