import {isNotNull} from 'parabol-client/utils/predicates'
import type {MeetingSettings} from '../../../../postgres/types'
import type {NewMeetingPhaseTypeEnum} from '../../resolverTypes'

interface SettingsChange {
  checkinEnabled?: boolean | null
  teamHealthEnabled?: boolean | null
  reviewPastTasksEnabled?: boolean | null
  disableAnonymity?: boolean | null
}

// true/false win outright; undefined/null keeps the phase as it is
const getFlagState = (
  phase: NewMeetingPhaseTypeEnum,
  explicit: boolean | null | undefined,
  phaseTypes: readonly NewMeetingPhaseTypeEnum[]
) => (isNotNull(explicit) ? explicit : phaseTypes.includes(phase))

const getNextMeetingSettings = (settings: MeetingSettings, change: SettingsChange) => {
  const {meetingType, phaseTypes, disableAnonymity} = settings
  const isRetro = meetingType === 'retrospective'
  const firstPhases: NewMeetingPhaseTypeEnum[] = []
  if (getFlagState('checkin', change.checkinEnabled, phaseTypes)) {
    firstPhases.push('checkin')
  }
  if (getFlagState('TEAM_HEALTH', change.teamHealthEnabled, phaseTypes)) {
    firstPhases.push('TEAM_HEALTH')
  }
  // 'updates' is canonical for retros only. For action meetings, 'updates' lives in the
  // tail of phaseTypes and is not toggleable here, so the filter below preserves it.
  if (isRetro && getFlagState('updates', change.reviewPastTasksEnabled, phaseTypes)) {
    firstPhases.push('updates')
  }
  return {
    phaseTypes: [
      ...firstPhases,
      ...phaseTypes.filter(
        (phase) =>
          phase !== 'checkin' && phase !== 'TEAM_HEALTH' && !(isRetro && phase === 'updates')
      )
    ],
    disableAnonymity: isNotNull(change.disableAnonymity)
      ? change.disableAnonymity
      : disableAnonymity
  }
}

export default getNextMeetingSettings
