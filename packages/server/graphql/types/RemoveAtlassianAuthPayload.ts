import {GraphQLID, GraphQLObjectType} from 'graphql'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import {GQLContext} from '../graphql'
import StandardMutationError from './StandardMutationError'
import TeamMember from './TeamMember'
import User from './User'

const RemoveAtlassianAuthPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'RemoveAtlassianAuthPayload',
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
      description: 'The user with updated atlassianAuth',
      resolve: ({userId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

export default RemoveAtlassianAuthPayload
