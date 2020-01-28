import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import publish from '../../utils/publish'
import {getUserId, isAuthenticated} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import rateLimit from '../rateLimit'
import ms from 'ms'
import PushInvitationPayload from '../types/PushInvitationPayload'
import PushInvitation from '../../database/types/PushInvitation'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

const MAX_GLOBAL_DENIALS = 3
const GLOBAL_DENIAL_TIME = ms('30d')
const MAX_TEAM_DENIALS = 2

export default {
  type: PushInvitationPayload,
  description: 'Request to be invited to a team in real time',
  args: {
    meetingId: {
      type: GraphQLID,
      description: 'the meeting ID the pusher would like to join'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: rateLimit({
    perMinute: 10,
    perHour: 20
  })(
    async (
      _source,
      {meetingId, teamId},
      {authToken, dataLoader, socketId: mutatorId}: GQLContext
    ) => {
      const r = await getRethink()
      const operationId = dataLoader.share()
      const subOptions = {mutatorId, operationId}
      const viewerId = getUserId(authToken)
      const thresh = new Date(Date.now() - GLOBAL_DENIAL_TIME)

      // AUTH
      if (!isAuthenticated(authToken)) return standardError(new Error('Not authenticated'))

      // VALIDATION
      const pushInvitations = (await r
        .table('PushInvitation')
        .getAll(viewerId, {index: 'userId'})
        .run()) as PushInvitation[]
      const teamPushInvitation = pushInvitations.find((row) => row.teamId === teamId)
      if (teamPushInvitation) {
        const {denialCount, lastDenialAt} = teamPushInvitation
        if (denialCount >= MAX_TEAM_DENIALS && lastDenialAt && lastDenialAt >= thresh) {
          return standardError(new Error('Previously denied. Must wait for an invitation'))
        }
      }

      const globalBlacklist = pushInvitations.filter(
        ({lastDenialAt}) => lastDenialAt && lastDenialAt >= thresh
      )
      if (globalBlacklist.length >= MAX_GLOBAL_DENIALS) {
        return standardError(new Error('Denied from other teams. Must wait for an invitation'))
      }

      // RESOLUTION
      if (!teamPushInvitation) {
        // create a row so we know there was a request so denials are substantiated
        await r
          .table('PushInvitation')
          .insert(new PushInvitation({userId: viewerId, teamId}))
          .run()
      }

      const data = {userId: viewerId, teamId, meetingId}
      publish(SubscriptionChannel.TEAM, teamId, 'PushInvitationPayload', data, subOptions)
      return null
    }
  )
}
