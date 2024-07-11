import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import updateTeamByTeamId from '../../../postgres/queries/updateTeamByTeamId'
import RedisLockQueue from '../../../utils/RedisLockQueue'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import createGcalEvent from '../../mutations/helpers/createGcalEvent'
import {createMeetingSeriesTitle} from '../../mutations/helpers/createMeetingSeriesTitle'
import isStartMeetingLocked from '../../mutations/helpers/isStartMeetingLocked'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import safeCreateTeamPrompt from '../../mutations/helpers/safeCreateTeamPrompt'
import {MutationResolvers} from '../resolverTypes'
import {startNewMeetingSeries} from './updateRecurrenceSettings'

const MEETING_START_DELAY_MS = 3000

const startTeamPrompt: MutationResolvers['startTeamPrompt'] = async (
  _source,
  {teamId, name, rrule, gcalInput},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const r = await getRethink()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const viewerId = getUserId(authToken)
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }
  const [unpaidError, viewer] = await Promise.all([
    isStartMeetingLocked(teamId, dataLoader),
    dataLoader.get('users').loadNonNull(viewerId)
  ])
  if (unpaidError) return standardError(new Error(unpaidError), {userId: viewerId})

  const redisLock = new RedisLockQueue(`newTeamPromptMeeting:${teamId}`, MEETING_START_DELAY_MS)
  try {
    await redisLock.lock(0)
  } catch (e) {
    return standardError(new Error('Meeting already started'), {
      userId: viewerId
    })
  }

  //TODO: use client timezone here (requires sending it from the client and passing it via gql context most likely)
  const meetingName = createMeetingSeriesTitle(name || 'Standup', new Date(), 'UTC')
  const eventName = rrule ? name || 'Standup' : meetingName
  const meeting = await safeCreateTeamPrompt(meetingName, teamId, viewerId, r, dataLoader)

  await Promise.all([
    r.table('NewMeeting').insert(meeting).run(),
    updateTeamByTeamId(
      {
        lastMeetingType: 'teamPrompt'
      },
      teamId
    )
  ])

  const {id: meetingId} = meeting
  if (rrule) {
    const meetingSeries = await startNewMeetingSeries(meeting, rrule, name)
    // meeting was modified if a new meeting series was created
    dataLoader.get('newMeetings').clear(meetingId)
    analytics.recurrenceStarted(viewer, meetingSeries)
  }
  IntegrationNotifier.startMeeting(dataLoader, meetingId, teamId)
  analytics.meetingStarted(viewer, meeting)
  const {error} = await createGcalEvent({
    name: eventName,
    gcalInput,
    meetingId,
    teamId,
    viewerId,
    dataLoader
  })
  const data = {teamId, meetingId: meetingId, hasGcalError: !!error?.message}
  publish(SubscriptionChannel.TEAM, teamId, 'StartTeamPromptSuccess', data, subOptions)
  return data
}

export default startTeamPrompt
