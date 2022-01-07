import {GraphQLObjectType} from 'graphql'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import TeamMember from './TeamMember'
import User from './User'

export const AddTeamMemberIntegrationAuthSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'AddTeamMemberIntegrationAuthSuccess',
  fields: () => ({
    teamMember: {
      type: TeamMember,
      description: 'The team member with the updated auth',
      resolve: ({teamId, userId}, _args, {dataLoader}) => {
        const teamMemberId = toTeamMemberId(teamId, userId)
        return dataLoader.get('teamMembers').load(teamMemberId)
      }
    },
    user: {
      type: User,
      description: 'The user who updated TeamMemberIntegrationAuth object',
      resolve: async ({userId}, _args, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

const AddTeamMemberIntegrationAuthPayload = makeMutationPayload(
  'AddTeamMemberIntegrationAuthPayload',
  AddTeamMemberIntegrationAuthSuccess
)

export default AddTeamMemberIntegrationAuthPayload
