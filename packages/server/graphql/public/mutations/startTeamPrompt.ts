import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {RRuleSet} from 'rrule-rust'
import getKysely from '../../../postgres/getKysely'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import {getNextRRuleDate} from '../../../utils/getNextRRuleDate'
import publish from '../../../utils/publish'
import RedisLockQueue from '../../../utils/RedisLockQueue'
import standardError from '../../../utils/standardError'
import createGcalEvent from '../../mutations/helpers/createGcalEvent'
import isStartMeetingLocked from '../../mutations/helpers/isStartMeetingLocked'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import safeCreateTeamPrompt from '../../mutations/helpers/safeCreateTeamPrompt'
import type {MutationResolvers} from '../resolverTypes'
import {createMeetingSeries, startNewMeetingSeries} from './updateRecurrenceSettings'

const MEETING_START_DELAY_MS = 3000

const startTeamPrompt: MutationResolvers['startTeamPrompt'] = async (
  _source,
  {teamId, name, rrule: rruleString, gcalInput},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const rrule = rruleString ? RRuleSet.parse(rruleString) : null

  // AUTH
  const viewerId = getUserId(authToken)

  const [unpaidError, viewer] = await Promise.all([
    isStartMeetingLocked(teamId, dataLoader),
    dataLoader.get('users').loadNonNull(viewerId)
  ])
  if (unpaidError) return standardError(new Error(unpaidError), {userId: viewerId})

  const meetingName = name || 'Standup'
  const eventName = rrule ? name || 'Standup' : meetingName

  // schedule-only path: rrule provided and its first occurrence is in the future
  const nextRRuleDate = rrule ? getNextRRuleDate(rrule) : null
  const isScheduledForFuture = !!(rrule && nextRRuleDate && nextRRuleDate.getTime() > Date.now())
  if (rrule && isScheduledForFuture) {
    const meetingSeries = await createMeetingSeries({
      meetingType: 'teamPrompt',
      title: name || meetingName,
      recurrenceRule: rrule,
      teamId,
      facilitatorId: viewerId
    })
    analytics.recurrenceStarted(viewer, meetingSeries)
    const {error: gcalError, gcalSeriesId} = await createGcalEvent({
      name: eventName,
      gcalInput,
      meetingId: null,
      teamId,
      viewerId,
      rrule,
      dataLoader
    })
    if (gcalSeriesId) {
      await getKysely()
        .updateTable('MeetingSeries')
        .set({gcalSeriesId})
        .where('id', '=', meetingSeries.id)
        .execute()
    }
    const data = {
      teamId,
      meetingId: null,
      meetingSeriesId: meetingSeries.id,
      hasGcalError: !!gcalError?.message
    }
    publish(SubscriptionChannel.TEAM, teamId, 'StartTeamPromptSuccess', data, subOptions)
    return data
  }

  const redisLock = new RedisLockQueue(`newTeamPromptMeeting:${teamId}`, MEETING_START_DELAY_MS)
  try {
    await redisLock.lock(0)
  } catch {
    return standardError(new Error('Meeting already started'), {
      userId: viewerId
    })
  }

  const meeting = await safeCreateTeamPrompt(meetingName, teamId, viewerId, dataLoader)
  if (!meeting) {
    return {error: {message: 'Meeting already started'}}
  }
  const {id: meetingId} = meeting
  const meetingSeries = rrule && (await startNewMeetingSeries(meeting, rrule, name))
  if (meetingSeries) {
    // meeting was modified if a new meeting series was created
    dataLoader.get('newMeetings').clear(meetingId)
    analytics.recurrenceStarted(viewer, meetingSeries)
  }
  IntegrationNotifier.startMeeting(dataLoader, meetingId, teamId)
  analytics.meetingStarted(viewer, meeting)
  const {error, gcalSeriesId} = await createGcalEvent({
    name: eventName,
    gcalInput,
    meetingId,
    teamId,
    viewerId,
    rrule,
    dataLoader
  })
  if (meetingSeries && gcalSeriesId) {
    const pg = getKysely()
    await pg
      .updateTable('MeetingSeries')
      .set({gcalSeriesId})
      .where('id', '=', meetingSeries.id)
      .execute()
  }
  const data = {
    teamId,
    meetingId: meetingId,
    meetingSeriesId: meetingSeries ? meetingSeries.id : null,
    hasGcalError: !!error?.message
  }
  publish(SubscriptionChannel.TEAM, teamId, 'StartTeamPromptSuccess', data, subOptions)
  return data
}

export default startTeamPrompt
