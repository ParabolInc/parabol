import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import getRethink from '../../database/rethinkDriver'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import FlagReadyToAdvancePayload from '../types/FlagReadyToAdvancePayload'

const flagReadyToAdvance = {
  type: new GraphQLNonNull(FlagReadyToAdvancePayload),
  description: `flag a viewer as ready to advance to the next stage of a meeting`,
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    stageId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the stage that the viewer marked as ready'
    },
    isReady: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if ready to advance, else false'
    }
  },
  resolve: async (
    _source: unknown,
    {meetingId, stageId, isReady}: {meetingId: string; stageId: string; isReady: boolean},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    //AUTH
    const meetingMemberId = toTeamMemberId(meetingId, viewerId)
    const [meeting, viewerMeetingMember] = await Promise.all([
      r.table('NewMeeting').get(meetingId).run(),
      dataLoader.get('meetingMembers').load(meetingMemberId)
    ])
    if (!meeting) {
      return {error: {message: 'Meeting not found'}}
    }
    if (!viewerMeetingMember) {
      return {error: {message: `Not a part of the meeting`}}
    }
    const {endedAt, phases} = meeting
    if (endedAt) {
      return {error: {message: 'Meeting already ended'}}
    }

    // VALIDATION
    const stageRes = findStageById(phases, stageId)
    if (!stageRes) {
      return {error: {message: 'Invalid meeting stage'}}
    }
    const {stage} = stageRes
    stage.readyToAdvance = stage.readyToAdvance || []
    const {isNavigable, readyToAdvance} = stage

    if (!isNavigable) {
      return {error: {message: 'Stage is not ready yet'}}
    }

    if (isReady) {
      if (readyToAdvance.includes(viewerId)) {
        return {error: {message: 'user is already ready'}}
      }
      readyToAdvance.push(viewerId)
    } else {
      const userIdIdx = readyToAdvance.indexOf(viewerId)
      if (userIdIdx === -1) {
        return {error: {message: 'user already not ready'}}
      }
      readyToAdvance.splice(userIdIdx, 1)
    }

    // RESOLUTION
    // TODO there's enough evidence showing that we should probably worry about atomicity
    await r.table('NewMeeting').get(meetingId).update({phases, updatedAt: now}).run()
    const data = {meetingId, stageId}
    publish(SubscriptionChannel.MEETING, meetingId, 'FlagReadyToAdvanceSuccess', data, subOptions)
    return data
  }
}

export default flagReadyToAdvance
