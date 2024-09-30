import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {isNotNull} from 'parabol-client/utils/predicates'
import getKysely from '../../../postgres/getKysely'
import {MeetingSettings} from '../../../postgres/types'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers, NewMeetingPhaseTypeEnum} from '../resolverTypes'

const setMeetingSettings: MutationResolvers['setMeetingSettings'] = async (
  _source,
  {settingsId, checkinEnabled, teamHealthEnabled, disableAnonymity, videoMeetingURL},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  // AUTH
  const viewerId = getUserId(authToken)
  const settings = (await dataLoader.get('meetingSettings').load(settingsId)) as MeetingSettings
  if (!settings) {
    return standardError(new Error('Settings not found'), {userId: viewerId})
  }

  // RESOLUTION
  const {teamId, meetingType, phaseTypes} = settings
  const [team, viewer] = await Promise.all([
    dataLoader.get('teams').loadNonNull(teamId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])
  const hasTranscriptFlag = await dataLoader
    .get('featureFlagByOwnerId')
    .load({ownerId: team.orgId, featureName: 'zoomTranscription'})

  const firstPhases: NewMeetingPhaseTypeEnum[] = []
  if (checkinEnabled || (checkinEnabled !== false && phaseTypes.includes('checkin'))) {
    firstPhases.push('checkin')
  }
  if (teamHealthEnabled || (teamHealthEnabled !== false && phaseTypes.includes('TEAM_HEALTH'))) {
    firstPhases.push('TEAM_HEALTH')
  }
  const nextSettings = {
    phaseTypes: [
      ...firstPhases,
      ...phaseTypes.filter((phase) => phase !== 'checkin' && phase !== 'TEAM_HEALTH')
    ],
    disableAnonymity: isNotNull(disableAnonymity) ? disableAnonymity : settings.disableAnonymity,
    videoMeetingURL: hasTranscriptFlag
      ? isNotNull(videoMeetingURL)
        ? videoMeetingURL
        : settings.videoMeetingURL
      : null
  }

  await getKysely()
    .updateTable('MeetingSettings')
    .set(nextSettings)
    .where('id', '=', settings.id)
    .execute()
  dataLoader.clearAll('meetingSettings')

  const data = {settingsId}
  analytics.meetingSettingsChanged(viewer, teamId, meetingType, {
    disableAnonymity: nextSettings.disableAnonymity,
    videoMeetingURL: nextSettings.videoMeetingURL,
    hasIcebreaker: nextSettings.phaseTypes.includes('checkin'),
    hasTeamHealth: nextSettings.phaseTypes.includes('TEAM_HEALTH')
  })
  publish(SubscriptionChannel.TEAM, teamId, 'SetMeetingSettingsPayload', data, subOptions)
  return data
}

export default setMeetingSettings
