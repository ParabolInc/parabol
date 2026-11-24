import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {isNotNull} from 'parabol-client/utils/predicates'
import getKysely from '../../../postgres/getKysely'
import type {MeetingSettings} from '../../../postgres/types'
import isPhaseAvailable from '../../../utils/isPhaseAvailable'
import publish from '../../../utils/publish'
import {getFeatureTier} from '../../types/helpers/getFeatureTier'
import type {MutationResolvers} from '../resolverTypes'
import applyRetroMeetingSettings from './helpers/applyRetroMeetingSettings'
import getNextMeetingSettings from './helpers/getNextMeetingSettings'
import switchMeetingTemplate, {getSwitchableTemplate} from './helpers/switchMeetingTemplate'

const setMeetingSettings: MutationResolvers['setMeetingSettings'] = async (
  _source,
  {
    settingsId,
    meetingId,
    templateId,
    clearTeamPromptResponses,
    checkinEnabled,
    teamHealthEnabled,
    reviewPastTasksEnabled,
    disableAnonymity
  },
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const change = {checkinEnabled, teamHealthEnabled, reviewPastTasksEnabled, disableAnonymity}
  const hasSettingsChange = Object.values(change).some(isNotNull)

  // AUTH
  const settings = (await dataLoader.get('meetingSettings').load(settingsId)) as MeetingSettings
  if (!settings) {
    throw new GraphQLError('Settings not found', {extensions: {code: 'NOT_FOUND'}})
  }
  const {teamId} = settings
  if (teamHealthEnabled) {
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    const org = await dataLoader.get('organizations').loadNonNull(team.orgId)
    if (!isPhaseAvailable(getFeatureTier(org))('TEAM_HEALTH')) {
      throw new GraphQLError('The Team Health phase needs a paid plan', {
        extensions: {code: 'UPGRADE_REQUIRED'}
      })
    }
  }

  // RESOLUTION
  if (!meetingId) {
    if (templateId) {
      throw new GraphQLError('A template changes with a meeting. Use selectTemplate for a team', {
        extensions: {code: 'BAD_USER_INPUT'}
      })
    }
    await getKysely()
      .updateTable('MeetingSettings')
      .set(getNextMeetingSettings(settings, change))
      .where('id', '=', settings.id)
      .execute()
    dataLoader.clearAll('meetingSettings')
    publish(SubscriptionChannel.TEAM, teamId, 'SetMeetingSettingsPayload', {settingsId}, subOptions)
    return {settingsId}
  }

  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
  if (meeting.teamId !== teamId || meeting.meetingType !== settings.meetingType) {
    throw new GraphQLError('These settings belong to another team or meeting type', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  if (meeting.endedAt) {
    throw new GraphQLError('The meeting has ended', {extensions: {code: 'CONFLICT'}})
  }
  if (hasSettingsChange && meeting.meetingType !== 'retrospective') {
    throw new GraphQLError('Only a retrospective changes these settings from inside the meeting', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  const series = meeting.meetingSeriesId
    ? await dataLoader.get('meetingSeries').load(meeting.meetingSeriesId)
    : null
  const isRecurring = !!series && !series.cancelledAt
  // check the template first, so a pick that can't apply leaves the settings untouched
  const template = templateId ? await getSwitchableTemplate(meeting, templateId, dataLoader) : null
  if (hasSettingsChange && meeting.meetingType === 'retrospective') {
    await applyRetroMeetingSettings({meeting, settings, isRecurring, change, dataLoader})
  }
  if (template) {
    await switchMeetingTemplate({
      meeting,
      template,
      applyToSeries: isRecurring,
      clearTeamPromptResponses: !!clearTeamPromptResponses,
      dataLoader,
      operationId
    })
  }

  const data = {settingsId, meetingId}
  publish(SubscriptionChannel.MEETING, meetingId, 'SetMeetingSettingsPayload', data, subOptions)
  if (hasSettingsChange && isRecurring) {
    publish(SubscriptionChannel.TEAM, teamId, 'SetMeetingSettingsPayload', {settingsId}, subOptions)
  }
  return data
}

export default setMeetingSettings
