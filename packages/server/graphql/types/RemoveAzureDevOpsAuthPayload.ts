import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import StandardMutationError from './StandardMutationError'
import {GraphQLID, GraphQLObjectType} from 'graphql'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import TeamMember from './TeamMember'
import User from './User'

export const RemoveAzureDevOpsAuthSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'RemoveAzureDevOpsAuthSuccess',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    teamId: {
      type: GraphQLID
    },
    teamMember: {
      type: TeamMember,
      description: 'The team member with the updated auth',
      resolve: ({teamId, userId}, _args: unknown, {dataLoader}) => {
        const teamMemberId = toTeamMemberId(teamId, userId)
        return dataLoader.get('teamMembers').load(teamMemberId)
      }
    },
    user: {
      type: User,
      description: 'The user with updated azureDevOpsAuth',
      resolve: ({userId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

const RemoveAzureDevOpsAuthPayload = makeMutationPayload(
  'RemoveAzureDevOpsAuthPayload',
  RemoveAzureDevOpsAuthSuccess
)

export default RemoveAzureDevOpsAuthPayload
