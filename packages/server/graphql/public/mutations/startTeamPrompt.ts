import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import updateTeamByTeamId from '../../../postgres/queries/updateTeamByTeamId'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import RedisLockQueue from '../../../utils/RedisLockQueue'
import standardError from '../../../utils/standardError'
import isStartMeetingLocked from '../../mutations/helpers/isStartMeetingLocked'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import safeCreateTeamPrompt from '../../mutations/helpers/safeCreateTeamPrompt'
import {MutationResolvers} from '../resolverTypes'
import {startNewMeetingSeries} from './updateRecurrenceSettings'
import {createTeamPromptTitle} from '../../../database/types/MeetingTeamPrompt'

const MEETING_START_DELAY_MS = 3000

const startTeamPrompt: MutationResolvers['startTeamPrompt'] = async (
  _source,
  {teamId, recurrenceSettings},
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
  const unpaidError = await isStartMeetingLocked(teamId, dataLoader)
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
  const meetingName = createTeamPromptTitle(
    recurrenceSettings?.name || 'Standup',
    new Date(),
    'UTC'
  )
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

  if (recurrenceSettings?.rrule) {
    const meetingSeries = await startNewMeetingSeries(
      viewerId,
      teamId,
      meeting.id,
      meeting.name,
      recurrenceSettings.rrule,
      recurrenceSettings.name
    )
    analytics.recurrenceStarted(viewerId, meetingSeries)
  }

  IntegrationNotifier.startMeeting(dataLoader, meeting.id, teamId)
  analytics.meetingStarted(viewerId, meeting)
  const data = {teamId, meetingId: meeting.id}
  publish(SubscriptionChannel.TEAM, teamId, 'StartTeamPromptSuccess', data, subOptions)
  return data
}

export default startTeamPrompt
