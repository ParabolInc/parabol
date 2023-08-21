import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {getUserId, isSuperUser, isTeamMember} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import rateLimit from '../rateLimit'
import GraphQLEmailType from '../types/GraphQLEmailType'
import inviteToTeamHelper from './helpers/inviteToTeamHelper'

export default {
  type: new GraphQLNonNull(
    new GraphQLObjectType({
      name: 'InviteToTeamPayload',
      fields: {}
    })
  ),
  description: 'Send a team invitation to an email address',
  args: {
    meetingId: {
      type: GraphQLID,
      description: 'the specific meeting where the invite occurred, if any'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the inviting team'
    },
    invitees: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLEmailType)))
    }
  },
  resolve: rateLimit({perMinute: 10, perHour: 100})(
    async (
      _source: unknown,
      {
        invitees: inviteesInput,
        meetingId,
        teamId
      }: {invitees: string[]; meetingId?: string | null; teamId: string},
      context: GQLContext
    ) => {
      const {authToken} = context

      // AUTH
      const viewerId = getUserId(authToken)
      if (!isTeamMember(authToken, teamId) && !isSuperUser(authToken)) {
        return standardError(new Error('Team not found'), {userId: viewerId})
      }
      return await inviteToTeamHelper(inviteesInput, teamId, meetingId, context)
    }
  )
}
