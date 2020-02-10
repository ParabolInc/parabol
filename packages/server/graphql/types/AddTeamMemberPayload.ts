import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import TeamMember from './TeamMember'
import {GQLContext} from '../graphql'

const AddTeamMemberPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'AddTeamMemberPayload',
  fields: () => ({
    teamMember: {
      type: new GraphQLNonNull(TeamMember)
    }
  })
})

export default AddTeamMemberPayload
