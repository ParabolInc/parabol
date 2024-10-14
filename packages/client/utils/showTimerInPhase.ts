import {NewMeetingPhaseTypeEnum} from '~/__generated__/ActionMeeting_meeting.graphql'

const noTimerPhases: NewMeetingPhaseTypeEnum[] = [
  'lobby',
  'checkin',
  'firstcall',
  'lastcall',
  'SUMMARY'
]

const showTimerInPhase = (phaseType: NewMeetingPhaseTypeEnum): boolean => {
  return !noTimerPhases.includes(phaseType)
}

export default showTimerInPhase
