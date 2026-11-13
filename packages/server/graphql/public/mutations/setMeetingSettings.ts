import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {isNotNull} from 'parabol-client/utils/predicates'
import getKysely from '../../../postgres/getKysely'
import type {MeetingSettings} from '../../../postgres/types'
import publish from '../../../utils/publish'
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
  {settingsId, checkinEnabled, teamHealthEnabled, reviewPastTasksEnabled, disableAnonymity},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  // AUTH
  const settings = (await dataLoader.get('meetingSettings').load(settingsId)) as MeetingSettings
  if (!settings) {
    throw new GraphQLError('Settings not found', {extensions: {code: 'NOT_FOUND'}})
  }

  // RESOLUTION
  const {teamId, meetingType, phaseTypes} = settings

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
    disableAnonymity: isNotNull(disableAnonymity) ? disableAnonymity : settings.disableAnonymity
  }

  await getKysely()
    .updateTable('MeetingSettings')
    .set(nextSettings)
    .where('id', '=', settings.id)
    .execute()
  dataLoader.clearAll('meetingSettings')

  const data = {settingsId}
  publish(SubscriptionChannel.TEAM, teamId, 'SetMeetingSettingsPayload', data, subOptions)
  return data
}

export default setMeetingSettings
