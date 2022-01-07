import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import TeamMemberId from '../../../client/shared/gqlIds/TeamMemberId'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import TeamMember from './TeamMember'
import User from './User'

export const RemoveIntegrationTokenSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'RemoveIntegrationTokenSuccess',
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
      description: 'The user who updated IntegrationToken object',
      resolve: async ({userId}, _args, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

const RemoveIntegrationTokenPayload = makeMutationPayload(
  'RemoveIntegrationTokenPayload',
  RemoveIntegrationTokenSuccess
)

export default RemoveIntegrationTokenPayload
