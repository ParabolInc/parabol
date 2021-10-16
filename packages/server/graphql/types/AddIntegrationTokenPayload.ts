import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import TeamMember from './TeamMember'
import User from './User'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'

export const AddIntegrationTokenSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'AddIntegrationTokenSuccess',
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
      description: 'The user who updated IntegrationToken object',
      resolve: async ({userId}, _args, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

const AddIntegrationTokenPayload = makeMutationPayload(
  'AddIntegrationTokenPayload',
  AddIntegrationTokenSuccess
)

export default AddIntegrationTokenPayload
