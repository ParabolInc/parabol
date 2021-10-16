import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import TeamMember from './TeamMember'
import User from './User'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'

export const AddIntegrationProviderSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'AddIntegrationProviderSuccess',
  fields: () => ({
    teamMember: {
      type: new GraphQLNonNull(TeamMember),
      description: 'The team member with the updated Integration Provider',
      resolve: ({teamId, userId}, _args, {dataLoader}) => {
        const teamMemberId = toTeamMemberId(teamId, userId)
        return dataLoader.get('teamMembers').load(teamMemberId)
      }
    },
    user: {
      type: new GraphQLNonNull(User),
      description: 'The user who updated Integration Provider object',
      resolve: async ({userId}, _args, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

const AddIntegrationProviderPayload = makeMutationPayload(
  'AddIntegrationProviderPayload',
  AddIntegrationProviderSuccess
)

export default AddIntegrationProviderPayload
