import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import User from 'server/graphql/types/User'
import {resolveUser} from 'server/graphql/resolvers'
import TeamMember from 'server/graphql/types/TeamMember'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'
import {GQLContext} from 'server/graphql/graphql'

const UpdateUserProfilePayload = new GraphQLObjectType<any, GQLContext, any>({
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
      resolve: ({teamIds, userId}, _args, {dataLoader}) => {
        const teamMemberIds = teamIds.map((teamId) => toTeamMemberId(teamId, userId))
        return dataLoader.get('teamMembers').loadMany(teamMemberIds)
      }
    }
  })
})

export default UpdateUserProfilePayload
