import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import rateLimit from '../rateLimit'
import DenyPushInvitationPayload from '../types/DenyPushInvitationPayload'
import PushInvitation from '../../database/types/PushInvitation'
import publish from '../../utils/publish'
import {TEAM} from '../../../universal/utils/constants'

export default {
  type: DenyPushInvitationPayload,
  description: 'Deny a user from joining via push invitation',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: rateLimit({
    perMinute: 10,
    perHour: 20
  })(async (_source, {userId, teamId}, {authToken, socketId: mutatorId}: GQLContext) => {
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

    // RESOLUTION
    await r
      .table('PushInvitation')
      .get(teamBlacklist.id)
      .update({denialCount: teamBlacklist.denialCount + 1, lastDenialAt: now})

    const data = {teamId, userId}
    publish(TEAM, teamId, DenyPushInvitationPayload, data, {mutatorId})
    return data
  })
}
