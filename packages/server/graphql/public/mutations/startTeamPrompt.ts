import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {RRuleSet} from 'rrule-rust'
import getKysely from '../../../postgres/getKysely'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import isCompanyOverLimit from '../../../utils/isCompanyOverLimit'
import publish from '../../../utils/publish'
import RedisLockQueue from '../../../utils/RedisLockQueue'
import standardError from '../../../utils/standardError'
import createGcalEvent from '../../mutations/helpers/createGcalEvent'
import isStartMeetingLocked from '../../mutations/helpers/isStartMeetingLocked'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import safeCreateTeamPrompt from '../../mutations/helpers/safeCreateTeamPrompt'
import type {MutationResolvers} from '../resolverTypes'
import {startNewMeetingSeries} from './updateRecurrenceSettings'

const MEETING_START_DELAY_MS = 3000

const startTeamPrompt: MutationResolvers['startTeamPrompt'] = async (
  _source,
  {teamId, name, rrule: rruleString, gcalInput, ignoreSuggestedUpgrade},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const rrule = rruleString ? RRuleSet.parse(rruleString) : null

  // AUTH
  const viewerId = getUserId(authToken)

  const [unpaidError, viewer, overLimitError] = await Promise.all([
    isStartMeetingLocked(teamId, dataLoader),
    dataLoader.get('users').loadNonNull(viewerId),
    isCompanyOverLimit(teamId, dataLoader)
  ])
  if (unpaidError) return standardError(new Error(unpaidError), {userId: viewerId})
  if (overLimitError) {
    if (overLimitError.errorCode === 'MAX_TEAM_UPGRADE_REQUIRED' || !ignoreSuggestedUpgrade) {
      const {teamCount, meetingCount, errorCode} = overLimitError
      throw new GraphQLError(`Your company has exceeded the free tier. Please upgrade`, {
        extensions: {code: errorCode, teamCount, meetingCount}
      })
    }
  }

  const redisLock = new RedisLockQueue(`newTeamPromptMeeting:${teamId}`, MEETING_START_DELAY_MS)
  try {
    await redisLock.lock(0)
  } catch {
    return standardError(new Error('Meeting already started'), {
      userId: viewerId
    })
  }

  const meetingName = name || 'Standup'
  const eventName = rrule ? name || 'Standup' : meetingName
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
  const data = {teamId, meetingId: meetingId, hasGcalError: !!error?.message}
  publish(SubscriptionChannel.TEAM, teamId, 'StartTeamPromptSuccess', data, subOptions)
  return data
}

export default startTeamPrompt
