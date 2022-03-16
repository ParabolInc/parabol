import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import StandardMutationError from './StandardMutationError'
import {GraphQLID, GraphQLObjectType} from 'graphql'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import TeamMember from './TeamMember'
import User from './User'

export const RemoveADOAuthSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'RemoveADOAuthSuccess',
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
      description: 'The user with updated adoAuth',
      resolve: ({userId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

const RemoveADOAuthPayload = makeMutationPayload('RemoveADOAuthPayload', RemoveADOAuthSuccess)

export default RemoveADOAuthPayload
