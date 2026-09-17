import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {RRuleSet} from 'rrule-rust'
import getKysely from '../../../postgres/getKysely'
import updateMeetingTemplateLastUsedAt from '../../../postgres/queries/updateMeetingTemplateLastUsedAt'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import {isImmediateOccurrence} from '../../../utils/isImmediateOccurrence'
import publish from '../../../utils/publish'
import RedisLockQueue from '../../../utils/RedisLockQueue'
import standardError from '../../../utils/standardError'
import createGcalEvent from '../../mutations/helpers/createGcalEvent'
import isStartMeetingLocked from '../../mutations/helpers/isStartMeetingLocked'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import resolveStandupTemplateId from '../../mutations/helpers/resolveStandupTemplateId'
import safeCreateTeamPrompt from '../../mutations/helpers/safeCreateTeamPrompt'
import type {MutationResolvers} from '../resolverTypes'
import {createMeetingSeries, startNewMeetingSeries} from './updateRecurrenceSettings'

const MEETING_START_DELAY_MS = 3000

const startTeamPrompt: MutationResolvers['startTeamPrompt'] = async (
  _source,
  {teamId, templateId: requestedTemplateId, name, rrule: rruleString, gcalInput},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const rrule = rruleString ? RRuleSet.parse(rruleString) : null

  // AUTH
  const viewerId = getUserId(authToken)

  const [unpaidError, viewer, team, meetingSettings] = await Promise.all([
    isStartMeetingLocked(teamId, dataLoader),
    dataLoader.get('users').loadNonNull(viewerId),
    dataLoader.get('teams').loadNonNull(teamId),
    dataLoader.get('meetingSettingsByType').load({teamId, meetingType: 'teamPrompt'})
  ])
  if (unpaidError) return standardError(new Error(unpaidError), {userId: viewerId})

  if (requestedTemplateId) {
    const requestedTemplate = await dataLoader.get('meetingTemplates').load(requestedTemplateId)
    if (
      !requestedTemplate ||
      !requestedTemplate.isActive ||
      requestedTemplate.type !== 'teamPrompt'
    ) {
      return standardError(new Error('Template not found'), {userId: viewerId})
    }
    if (requestedTemplate.scope === 'TEAM' && !isTeamMember(authToken, requestedTemplate.teamId)) {
      return standardError(new Error('Template is scoped to team'), {userId: viewerId})
    }
    if (requestedTemplate.scope === 'ORGANIZATION' && requestedTemplate.orgId !== team.orgId) {
      return standardError(new Error('Template is scoped to organization'), {userId: viewerId})
    }
  }
  const templateId = await resolveStandupTemplateId(
    [requestedTemplateId, meetingSettings?.selectedTemplateId],
    dataLoader
  )

  const meetingName = name || 'Standup'
  const eventName = rrule ? name || 'Standup' : meetingName

  if (rrule && !isImmediateOccurrence(rrule)) {
    const scheduleLock = new RedisLockQueue(`newMeetingSeries:${teamId}`, MEETING_START_DELAY_MS)
    try {
      await scheduleLock.lock(0)
    } catch {
      return standardError(new Error('Meeting already scheduled'), {userId: viewerId})
    }
    const meetingSeries = await createMeetingSeries({
      meetingType: 'teamPrompt',
      title: name || meetingName,
      recurrenceRule: rrule,
      teamId,
      facilitatorId: viewerId,
      templateId
    })
    analytics.recurrenceStarted(viewer, meetingSeries)
    const {error: gcalError, gcalSeriesId} = await createGcalEvent({
      name: eventName,
      gcalInput,
      meetingId: null,
      meetingSeriesId: meetingSeries.id,
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

  const meeting = await safeCreateTeamPrompt(meetingName, teamId, viewerId, dataLoader, {
    templateId
  })
  if (!meeting) {
    return {error: {message: 'Meeting already started'}}
  }
  const {id: meetingId} = meeting
  if (meeting.templateId) {
    await updateMeetingTemplateLastUsedAt(meeting.templateId, teamId)
  }
  const meetingSeries =
    rrule && (await startNewMeetingSeries(meeting, rrule, name, {templateId: meeting.templateId}))
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
    meetingSeriesId: meetingSeries ? meetingSeries.id : null,
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
