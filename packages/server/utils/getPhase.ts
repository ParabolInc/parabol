import {NewMeetingPhase} from '../postgres/types/NewMeetingPhase'

const getPhase = <T extends NewMeetingPhase['phaseType']>(
  phases: NewMeetingPhase[],
  phaseType: T
) => {
  return phases.find((phase) => phase.phaseType === phaseType) as Extract<
    NewMeetingPhase,
    {phaseType: T}
  >
}

export default getPhase
