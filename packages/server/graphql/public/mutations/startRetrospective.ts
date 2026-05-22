import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {RRuleSet} from 'rrule-rust'
import getKysely from '../../../postgres/getKysely'
import updateMeetingTemplateLastUsedAt from '../../../postgres/queries/updateMeetingTemplateLastUsedAt'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import {isImmediateOccurrence} from '../../../utils/isImmediateOccurrence'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import createGcalEvent from '../../mutations/helpers/createGcalEvent'
import isStartMeetingLocked from '../../mutations/helpers/isStartMeetingLocked'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import safeCreateRetrospective from '../../mutations/helpers/safeCreateRetrospective'
import type {MutationResolvers} from '../resolverTypes'
import {createMeetingMember} from './joinMeeting'
import {createMeetingSeries, startNewMeetingSeries} from './updateRecurrenceSettings'

const startRetrospective: MutationResolvers['startRetrospective'] = async (
  _source,
  {teamId, name, rrule: rruleString, gcalInput},
  {authToken, socketId: mutatorId, dataLoader}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const rrule = rruleString ? RRuleSet.parse(rruleString) : null
  // AUTH
  const viewerId = getUserId(authToken)

  // RESOLUTION
  const meetingType = 'retrospective' as const
  const [unpaidError, viewer, meetingSettings, meetingCount] = await Promise.all([
    isStartMeetingLocked(teamId, dataLoader),
    dataLoader.get('users').loadNonNull(viewerId),
    dataLoader.get('meetingSettingsByType').loadNonNull({teamId, meetingType}),
    dataLoader.get('meetingCount').load({teamId, meetingType})
  ])
  if (unpaidError) return standardError(new Error(unpaidError), {userId: viewerId})
  const {
    id: meetingSettingsId,
    totalVotes,
    maxVotesPerGroup,
    disableAnonymity,
    videoMeetingURL
  } = meetingSettings as typeof meetingSettings & {
    meetingType: 'retrospective'
  }
  const selectedTemplateId = meetingSettings.selectedTemplateId || 'workingStuckTemplate'
  const meetingName = !name ? `Retro #${meetingCount + 1}` : name
  const meetingSeriesName = name || meetingName

  if (rrule && !isImmediateOccurrence(rrule)) {
    const meetingSeries = await createMeetingSeries({
      meetingType,
      title: meetingSeriesName,
      recurrenceRule: rrule,
      teamId,
      facilitatorId: viewerId
    })
    analytics.recurrenceStarted(viewer, meetingSeries)
    const {error: gcalError, gcalSeriesId} = await createGcalEvent({
      name: meetingSeriesName,
      gcalInput,
      meetingId: null,
      meetingSeriesId: meetingSeries.id,
      teamId,
      viewerId,
      rrule,
      dataLoader
    })
    if (gcalSeriesId) {
      await pg
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
    publish(SubscriptionChannel.TEAM, teamId, 'StartRetrospectiveSuccess', data, subOptions)
    return data
  }

  const meeting = await safeCreateRetrospective(
    {
      teamId,
      facilitatorUserId: viewerId,
      totalVotes,
      maxVotesPerGroup,
      disableAnonymity,
      templateId: selectedTemplateId,
      videoMeetingURL: videoMeetingURL ?? undefined,
      name: meetingName
    },
    dataLoader
  )
  if (!meeting) {
    return {error: {message: 'Meeting already started'}}
  }
  const meetingId = meeting.id
  const template = await dataLoader.get('meetingTemplates').load(selectedTemplateId)
  await updateMeetingTemplateLastUsedAt(selectedTemplateId, teamId)

  const meetingMember = createMeetingMember(meeting, {
    userId: viewerId,
    teamId,
    isSpectatingPoker: false
  })
  const [meetingSeries] = await Promise.all([
    rrule && startNewMeetingSeries(meeting, rrule, meetingSeriesName),
    pg
      .with('TeamUpdates', (qb) =>
        qb.updateTable('Team').set({lastMeetingType: meetingType}).where('id', '=', teamId)
      )
      .insertInto('MeetingMember')
      .values(meetingMember)
      .execute(),
    videoMeetingURL &&
      pg
        .updateTable('MeetingSettings')
        .set({videoMeetingURL: null})
        .where('id', '=', meetingSettingsId)
        .execute()
  ])
  if (meetingSeries) {
    // meeting was modified if a new meeting series was created
    dataLoader.get('newMeetings').clear(meetingId)
    dataLoader.get('activeMeetingsByTeamId').clear(teamId)
    analytics.recurrenceStarted(viewer, meetingSeries)
  }
  IntegrationNotifier.startMeeting(dataLoader, meetingId, teamId)
  analytics.meetingStarted(viewer, meeting, template)
  const {error, gcalSeriesId} = await createGcalEvent({
    name: meetingSeriesName,
    gcalInput,
    meetingId,
    meetingSeriesId: meetingSeries ? meetingSeries.id : null,
    teamId,
    viewerId,
    rrule,
    dataLoader
  })
  if (meetingSeries && gcalSeriesId) {
    await pg
      .updateTable('MeetingSeries')
      .set({gcalSeriesId})
      .where('id', '=', meetingSeries.id)
      .execute()
  }
  const data = {
    teamId,
    meetingId,
    meetingSeriesId: meetingSeries ? meetingSeries.id : null,
    hasGcalError: !!error?.message
  }
  publish(SubscriptionChannel.TEAM, teamId, 'StartRetrospectiveSuccess', data, subOptions)
  return data
}

export default startRetrospective
