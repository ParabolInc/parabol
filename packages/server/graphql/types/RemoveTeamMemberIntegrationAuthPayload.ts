import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import TeamMemberId from '../../../client/shared/gqlIds/TeamMemberId'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import TeamMember from './TeamMember'
import User from './User'

export const RemoveTeamMemberIntegrationAuthSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'RemoveTeamMemberIntegrationAuthSuccess',
  fields: () => ({
    teamMember: {
      type: new GraphQLNonNull(TeamMember),
      description: 'The team member with the updated auth',
      resolve: ({teamId, userId}, _args, {dataLoader}) => {
        const teamMemberId = TeamMemberId.join(teamId, userId)
        return dataLoader.get('teamMembers').load(teamMemberId)
      }
    },
    user: {
      type: new GraphQLNonNull(User),
      description: 'The user who updated TeamMemberIntegrationAuth object',
      resolve: async ({userId}, _args, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

const RemoveTeamMemberIntegrationAuthPayload = makeMutationPayload(
  'RemoveTeamMemberIntegrationAuthPayload',
  RemoveTeamMemberIntegrationAuthSuccess
)

export default RemoveTeamMemberIntegrationAuthPayload
