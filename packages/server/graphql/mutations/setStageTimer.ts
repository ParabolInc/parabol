import {GraphQLFloat, GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import getRethink from '../../database/rethinkDriver'
import ScheduledJobMeetingStageTimeLimit from '../../database/types/ScheduledJobMetingStageTimeLimit'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from '../types/GraphQLISO8601Type'
import SetStageTimerPayload from '../types/SetStageTimerPayload'
import {IntegrationNotifier} from './helpers/notifications/IntegrationNotifier'
import removeScheduledJobs from './helpers/removeScheduledJobs'

const BAD_CLOCK_THRESH = 2000
const AVG_PING = 150

export default {
  type: new GraphQLNonNull(SetStageTimerPayload),
  description: 'Set or clear a timer for a meeting stage',
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the id of the meeting'
    },
    scheduledEndTime: {
      type: GraphQLISO8601Type,
      description:
        'The time the timer is scheduled to go off (based on client clock), null if unsetting the timer'
    },
    timeRemaining: {
      type: GraphQLFloat,
      description:
        'scheduledEndTime - now. Used to reconcile bad client clocks. Present for time limit, else null'
    }
  },
  async resolve(
    _source: unknown,
    {
      meetingId,
      scheduledEndTime: newScheduledEndTime,
      timeRemaining
    }: {scheduledEndTime: Date | null; meetingId: string; timeRemaining: number | null},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)
    const now = new Date()

    // AUTH
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    const {endedAt, facilitatorStageId, facilitatorUserId, phases, teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})
    if (facilitatorUserId !== viewerId) {
      return standardError(new Error('Not the facilitator'), {userId: viewerId})
    }

    // VALIDATION
    if (newScheduledEndTime && newScheduledEndTime.getTime() < now.getTime()) {
      return standardError(new Error('Time must be in the future'), {userId: viewerId})
    }

    const stageRes = findStageById(phases, facilitatorStageId)!
    const {stage} = stageRes
    const {scheduledEndTime, isComplete} = stage
    if (isComplete) {
      return standardError(new Error('Stage is already complete'), {userId: viewerId})
    }

    // RESOLUTION
    if (scheduledEndTime) {
      // remove existing jobs
      await removeScheduledJobs(scheduledEndTime, {meetingId})
    }
    if (newScheduledEndTime) {
      if (timeRemaining) {
        stage.isAsync = false
        const actualTimeRemaining = newScheduledEndTime.getTime() - now.getTime()
        const badClientClock = Math.abs(timeRemaining - actualTimeRemaining) > BAD_CLOCK_THRESH
        stage.scheduledEndTime = badClientClock
          ? new Date(now.getTime() + timeRemaining - AVG_PING)
          : newScheduledEndTime
      } else {
        stage.isAsync = true
        stage.scheduledEndTime = newScheduledEndTime
        await r
          .table('ScheduledJob')
          .insert(new ScheduledJobMeetingStageTimeLimit(newScheduledEndTime, meetingId))
          .run()
        IntegrationNotifier.startTimeLimit(dataLoader, newScheduledEndTime, meetingId, teamId)
      }
    } else {
      // TODO delete slack message when unset
      stage.isAsync = null
      stage.scheduledEndTime = null
    }

    // RESOLUTION
    await r
      .table('NewMeeting')
      .get(meetingId)
      .update({
        phases,
        updatedAt: now
      })
      .run()

    const data = {meetingId, stageId: facilitatorStageId}
    const {isAsync, phaseType, startAt, viewCount} = stage
    const stoppedOrStarted = newScheduledEndTime ? `Meeting Timer Started` : `Meeting Timer Stopped`
    const eventName =
      scheduledEndTime && newScheduledEndTime ? `Meeting Timer Updated` : stoppedOrStarted
    publish(SubscriptionChannel.MEETING, meetingId, 'SetStageTimerPayload', data, subOptions)
    segmentIo.track({
      userId: viewerId,
      event: eventName,
      properties: {
        isAsync,
        meetingId,
        newScheduledEndTime,
        phaseType,
        previousScheduledEndTime: scheduledEndTime,
        stageStartAt: startAt,
        timeRemaining,
        viewCount
      }
    })
    return data
  }
}
