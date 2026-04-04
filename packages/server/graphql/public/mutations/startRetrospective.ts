import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import updateMeetingTemplateLastUsedAt from '../../../postgres/queries/updateMeetingTemplateLastUsedAt'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import isCompanyOverLimit from '../../../utils/isCompanyOverLimit'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import createGcalEvent from '../../mutations/helpers/createGcalEvent'
import isStartMeetingLocked from '../../mutations/helpers/isStartMeetingLocked'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import safeCreateRetrospective from '../../mutations/helpers/safeCreateRetrospective'
import type {MutationResolvers} from '../resolverTypes'
import {createMeetingMember} from './joinMeeting'
import {startNewMeetingSeries} from './updateRecurrenceSettings'

const startRetrospective: MutationResolvers['startRetrospective'] = async (
  _source,
  {teamId, name, rrule, gcalInput, ignoreSuggestedUpgrade},
  {authToken, socketId: mutatorId, dataLoader}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  // AUTH
  const viewerId = getUserId(authToken)

  // RESOLUTION
  const meetingType = 'retrospective' as const
  const [unpaidError, viewer, meetingSettings, meetingCount, overLimitError] = await Promise.all([
    isStartMeetingLocked(teamId, dataLoader),
    dataLoader.get('users').loadNonNull(viewerId),
    dataLoader.get('meetingSettingsByType').loadNonNull({teamId, meetingType}),
    dataLoader.get('meetingCount').load({teamId, meetingType}),
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
  const data = {teamId, meetingId, hasGcalError: !!error?.message}
  publish(SubscriptionChannel.TEAM, teamId, 'StartRetrospectiveSuccess', data, subOptions)
  return data
}

export default startRetrospective
