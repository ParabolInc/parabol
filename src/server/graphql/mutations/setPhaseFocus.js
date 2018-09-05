import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import {getUserId} from 'server/utils/authorization'
import {sendNotMeetingFacilitatorError} from 'server/utils/authorizationErrors'
import SetPhaseFocusPayload from 'server/graphql/types/SetPhaseFocusPayload'
import {sendMeetingNotFoundError} from 'server/utils/docNotFoundErrors'
import {
  sendAlreadyCompletedMeetingPhaseError,
  sendAlreadyEndedMeetingError
} from 'server/utils/alreadyMutatedErrors'
import publish from 'server/utils/publish'
import {REFLECT, TEAM} from 'universal/utils/constants'
import isPhaseComplete from 'universal/utils/meetings/isPhaseComplete'

const setPhaseFocus = {
  type: SetPhaseFocusPayload,
  description: 'Focus (or unfocus) a phase item',
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    focusedPhaseItemId: {
      type: GraphQLID,
      description: 'The currently focused phase item'
    }
  },
  async resolve (
    source,
    {meetingId, focusedPhaseItemId},
    {authToken, dataLoader, socketId: mutatorId}
  ) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}

    // AUTH
    const viewerId = getUserId(authToken)
    const meeting = await r
      .table('NewMeeting')
      .get(meetingId)
      .default(null)
    if (!meeting) return sendMeetingNotFoundError(authToken, meetingId)
    const {endedAt, facilitatorUserId, phases, teamId} = meeting
    if (endedAt) return sendAlreadyEndedMeetingError(authToken, meetingId)
    if (isPhaseComplete(REFLECT, phases)) {
      return sendAlreadyCompletedMeetingPhaseError(authToken, REFLECT)
    }
    if (facilitatorUserId !== viewerId) {
      return sendNotMeetingFacilitatorError(authToken, viewerId)
    }
    const phase = meeting.phases.find((phase) => phase.phaseType === REFLECT)
    if (!phase) {
      return sendMeetingNotFoundError(authToken, meetingId)
    }

    // RESOLUTION
    // mutative
    phase.focusedPhaseItemId = focusedPhaseItemId || null
    await r
      .table('NewMeeting')
      .get(meetingId)
      .update(meeting)
    const data = {meetingId}
    publish(TEAM, teamId, SetPhaseFocusPayload, data, subOptions)
    return data
  }
}

export default setPhaseFocus
