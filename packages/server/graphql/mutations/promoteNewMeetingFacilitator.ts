import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import PromoteNewMeetingFacilitatorPayload from '../types/PromoteNewMeetingFacilitatorPayload'

export default {
  type: PromoteNewMeetingFacilitatorPayload,
  description: 'Change a facilitator while the meeting is in progress',
  args: {
    facilitatorUserId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'userId of the new facilitator for this meeting'
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(
    _source: unknown,
    {facilitatorUserId, meetingId}: {facilitatorUserId: string; meetingId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {facilitatorUserId: oldFacilitatorUserId, teamId, endedAt} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const newFacilitator = await dataLoader.get('users').load(facilitatorUserId)
    if (!newFacilitator) {
      return standardError(new Error('New facilitator does not exist'), {userId: viewerId})
    }
    if (!newFacilitator.tms.includes(teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (endedAt) {
      return {error: {message: 'Meeting has already ended'}}
    }

    // RESOLUTION
    await getKysely()
      .updateTable('NewMeeting')
      .set({facilitatorUserId})
      .where('id', '=', meetingId)
      .execute()
    dataLoader.clearAll('newMeetings')
    const data = {meetingId, oldFacilitatorUserId}
    publish(
      SubscriptionChannel.MEETING,
      meetingId,
      'PromoteNewMeetingFacilitatorPayload',
      data,
      subOptions
    )
    return data
  }
}
