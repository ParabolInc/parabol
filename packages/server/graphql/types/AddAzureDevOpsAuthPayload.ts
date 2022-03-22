// import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GraphQLObjectType, GraphQLID} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import StandardMutationError from './StandardMutationError'
import TeamMember from './TeamMember'
import User from './User'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import AzureDevOpsIntegration from './AzureDevOpsIntegration'

export const AddAzureDevOpsAuthSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'AddAzureDevOpsAuthSuccess',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    azureDevOpsIntegration: {
      type: AzureDevOpsIntegration,
      description: 'The newly created auth',
      resolve: async ({teamId, userId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('freshAzureDevOpsAuth').load({teamId, userId})
      }
    },
    teamId: {
      type: GraphQLID
    },
    teamMember: {
      type: TeamMember,
      description: 'The team member with the updated AzureDevOpsAuth',
      resolve: ({teamId, userId}, _args: unknown, {dataLoader}) => {
        const teamMemberId = toTeamMemberId(teamId, userId)
        return dataLoader.get('teamMembers').load(teamMemberId)
      }
    },
    user: {
      type: User,
      description: 'The user with updated AzureDevOpsAuth',
      resolve: ({userId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

const AddAzureDevOpsAuthPayload = makeMutationPayload(
  'AddAzureDevOpsAuthPayload',
  AddAzureDevOpsAuthSuccess
)

export default AddAzureDevOpsAuthPayload
