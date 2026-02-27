import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import ScheduledJobMeetingStageTimeLimit from '../../../database/types/ScheduledJobMetingStageTimeLimit'
import getKysely from '../../../postgres/getKysely'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import removeScheduledJobs from '../../mutations/helpers/removeScheduledJobs'
import type {MutationResolvers} from '../resolverTypes'

const BAD_CLOCK_THRESH = 2000
const AVG_PING = 150

const setStageTimer: MutationResolvers['setStageTimer'] = async (
  _source,
  {meetingId, scheduledEndTime: newScheduledEndTime, timeRemaining},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)
  const now = new Date()

  // AUTH
  const [meeting, viewer] = await Promise.all([
    dataLoader.get('newMeetings').loadNonNull(meetingId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])
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
      await pg
        .insertInto('ScheduledJob')
        .values(new ScheduledJobMeetingStageTimeLimit(newScheduledEndTime, meetingId))
        .execute()
      IntegrationNotifier.startTimeLimit(dataLoader, newScheduledEndTime, meetingId, teamId)
    }
  } else {
    stage.isAsync = null
    stage.scheduledEndTime = null
  }

  await pg
    .updateTable('NewMeeting')
    .set({phases: JSON.stringify(phases)})
    .where('id', '=', meetingId)
    .execute()
  const data = {meetingId, stageId: facilitatorStageId}
  const {isAsync, phaseType, startAt, viewCount} = stage
  const stoppedOrStarted = newScheduledEndTime ? `Meeting Timer Started` : `Meeting Timer Stopped`
  const eventName =
    scheduledEndTime && newScheduledEndTime ? `Meeting Timer Updated` : stoppedOrStarted
  publish(SubscriptionChannel.MEETING, meetingId, 'SetStageTimerPayload', data, subOptions)
  analytics.meetingTimerEvent(viewer, eventName, {
    meetingId,
    phaseType,
    viewCount,
    isAsync,
    newScheduledEndTime: newScheduledEndTime ?? null,
    timeRemaining: timeRemaining ?? null,
    previousScheduledEndTime: scheduledEndTime,
    stageStartAt: startAt
  })
  return data
}

export default setStageTimer
