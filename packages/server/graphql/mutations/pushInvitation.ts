import {GraphQLID, GraphQLNonNull} from 'graphql'
import ms from 'ms'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import PushInvitation from '../../database/types/PushInvitation'
import {getUserId, isAuthenticated} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import getIsUserIdApprovedByOrg from '../public/mutations/helpers/getIsUserIdApprovedByOrg'
import rateLimit from '../rateLimit'
import PushInvitationPayload from '../types/PushInvitationPayload'

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
      _source: unknown,
      {meetingId, teamId}: {meetingId?: string | null; teamId: string},
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
      const team = await dataLoader.get('teams').load(teamId)
      if (!team) {
        return {error: {message: 'Invalid teamId'}}
      }

      const {orgId} = team
      const approvalError = await getIsUserIdApprovedByOrg(viewerId, orgId, dataLoader)
      if (approvalError instanceof Error) {
        return {error: {message: approvalError.message}}
      }
      const pushInvitations = (await r
        .table('PushInvitation')
        .getAll(viewerId, {index: 'userId'})
        .run()) as PushInvitation[]
      const teamPushInvitation = pushInvitations.find((row) => row.teamId === teamId)
      if (teamPushInvitation) {
        const {denialCount, lastDenialAt} = teamPushInvitation
        if (denialCount >= MAX_TEAM_DENIALS && lastDenialAt && lastDenialAt >= thresh) {
          return standardError(new Error('Previously denied. Must wait for an invitation'), {
            userId: viewerId
          })
        }
      }

      const globalBlacklist = pushInvitations.filter(
        ({lastDenialAt}) => lastDenialAt && lastDenialAt >= thresh
      )
      if (globalBlacklist.length >= MAX_GLOBAL_DENIALS) {
        return standardError(new Error('Denied from other teams. Must wait for an invitation'), {
          userId: viewerId
        })
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
