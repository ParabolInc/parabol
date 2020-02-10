import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId} from '../../utils/authorization'
import SetPhaseFocusPayload from '../types/SetPhaseFocusPayload'
import publish from '../../utils/publish'
import {GROUP, REFLECT} from '../../../client/utils/constants'
import isPhaseComplete from '../../../client/utils/meetings/isPhaseComplete'
import standardError from '../../utils/standardError'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import ReflectPhase from '../../database/types/ReflectPhase'

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
  async resolve(
    _source,
    {meetingId, focusedPhaseItemId},
    {authToken, dataLoader, socketId: mutatorId}
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}

    // AUTH
    const viewerId = getUserId(authToken)
    const meeting = await r
      .table('NewMeeting')
      .get(meetingId)
      .default(null)
      .run()
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {endedAt, facilitatorUserId, phases} = meeting
    if (endedAt) return standardError(new Error('Meeting already completed'), {userId: viewerId})
    if (isPhaseComplete(GROUP, phases)) {
      return standardError(new Error('Meeting phase already completed'), {userId: viewerId})
    }
    if (facilitatorUserId !== viewerId) {
      return standardError(new Error('Not meeting facilitator'), {userId: viewerId})
    }
    const phase = meeting.phases.find((phase) => phase.phaseType === REFLECT) as ReflectPhase
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
      .run()
    const data = {meetingId}
    publish(SubscriptionChannel.MEETING, meetingId, 'SetPhaseFocusPayload', data, subOptions)
    return data
  }
}

export default setPhaseFocus
