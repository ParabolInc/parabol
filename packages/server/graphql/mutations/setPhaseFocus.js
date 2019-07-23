import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import {getUserId} from 'server/utils/authorization'
import SetPhaseFocusPayload from 'server/graphql/types/SetPhaseFocusPayload'
import publish from 'server/utils/publish'
import {REFLECT, TEAM} from 'universal/utils/constants'
import isPhaseComplete from 'universal/utils/meetings/isPhaseComplete'
import standardError from 'server/utils/standardError'

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
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {endedAt, facilitatorUserId, phases, teamId} = meeting
    if (endedAt) return standardError(new Error('Meeting already completed'), {userId: viewerId})
    if (isPhaseComplete(REFLECT, phases)) {
      return standardError(new Error('Meeting phase already completed'), {userId: viewerId})
    }
    if (facilitatorUserId !== viewerId) {
      return standardError(new Error('Not meeting facilitator'), {userId: viewerId})
    }
    const phase = meeting.phases.find((phase) => phase.phaseType === REFLECT)
    if (!phase) {
      return standardError(new Error('Meeting not found'), {userId: viewerId})
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
