import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import standardError from 'server/utils/standardError'
import {GQLContext} from 'server/graphql/graphql'
import rateLimit from 'server/graphql/rateLimit'
import DenyPushInvitationPayload from 'server/graphql/types/DenyPushInvitationPayload'
import PushInvitation from 'server/database/types/PushInvitation'

export default {
  type: DenyPushInvitationPayload,
  description: 'Deny a user from joining via push invitation',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: rateLimit({
    perMinute: 10,
    perHour: 20
  })(async (_source, {userId, teamId}, {authToken}: GQLContext) => {
    const r = getRethink()
    const viewerId = getUserId(authToken)
    const now = new Date()

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const teamBlacklist = (await r
      .table('PushInvitation')
      .getAll(userId, {index: 'userId'})
      .filter({teamId})
      .nth(0)) as PushInvitation | null

    if (!teamBlacklist) {
      return standardError(new Error('User did not request push invitation'), {userId: viewerId})
    }

    await r
      .table('PushInvitation')
      .get(teamBlacklist.id)
      .update({denialCount: teamBlacklist.denialCount + 1, lastDeniedAt: now})

    // RESOLUTION
    return null
  })
}
