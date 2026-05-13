import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {isNotNull} from 'parabol-client/utils/predicates'
import getKysely from '../../../postgres/getKysely'
import type {MeetingSettings} from '../../../postgres/types'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {MutationResolvers, NewMeetingPhaseTypeEnum} from '../resolverTypes'

// Resolve a phase's enabled state from an explicit flag and the existing phaseTypes
// array. true/false win outright; undefined/null means "keep current".
const getFlagState = (
  phase: NewMeetingPhaseTypeEnum,
  explicit: boolean | null | undefined,
  phaseTypes: readonly NewMeetingPhaseTypeEnum[]
): boolean => {
  if (explicit === true) return true
  if (explicit === false) return false
  return phaseTypes.includes(phase)
}

const setMeetingSettings: MutationResolvers['setMeetingSettings'] = async (
  _source,
  {
    settingsId,
    checkinEnabled,
    teamHealthEnabled,
    reviewPastTasksEnabled,
    disableAnonymity,
    videoMeetingURL
  },
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

  const isRetro = meetingType === 'retrospective'

  const firstPhases: NewMeetingPhaseTypeEnum[] = []
  if (getFlagState('checkin', checkinEnabled, phaseTypes)) {
    firstPhases.push('checkin')
  }
  if (getFlagState('TEAM_HEALTH', teamHealthEnabled, phaseTypes)) {
    firstPhases.push('TEAM_HEALTH')
  }
  // 'updates' is canonical for retros only. For action meetings, 'updates' lives in the
  // tail of phaseTypes and is not toggleable via this mutation, so it's preserved by the
  // filter below (which only strips it when meetingType === 'retrospective').
  if (isRetro && getFlagState('updates', reviewPastTasksEnabled, phaseTypes)) {
    firstPhases.push('updates')
  }

  const nextSettings = {
    phaseTypes: [
      ...firstPhases,
      ...phaseTypes.filter(
        (phase) =>
          phase !== 'checkin' && phase !== 'TEAM_HEALTH' && !(isRetro && phase === 'updates')
      )
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
    hasTeamHealth: nextSettings.phaseTypes.includes('TEAM_HEALTH'),
    hasReviewPastTasks: isRetro && nextSettings.phaseTypes.includes('updates')
  })
  publish(SubscriptionChannel.TEAM, teamId, 'SetMeetingSettingsPayload', data, subOptions)
  return data
}

export default setMeetingSettings
