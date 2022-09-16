import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {GQLContext} from '../graphql'
import {resolveUser} from '../resolvers'
import StandardMutationError from './StandardMutationError'
import TeamMember from './TeamMember'
import User from './User'

const UpdateUserProfilePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdateUserProfilePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    user: {
      type: User,
      resolve: resolveUser
    },
    teamMembers: {
      type: new GraphQLList(new GraphQLNonNull(TeamMember)),
      description: 'The updated team member',
      resolve: (
        {teamIds, userId}: {teamIds?: string[]; userId: string},
        _args: unknown,
        {dataLoader}: GQLContext
      ) => {
        if (!teamIds) return []
        const teamMemberIds = teamIds.map((teamId) => toTeamMemberId(teamId, userId))
        return dataLoader.get('teamMembers').loadMany(teamMemberIds)
      }
    }
  })
})

export default UpdateUserProfilePayload
