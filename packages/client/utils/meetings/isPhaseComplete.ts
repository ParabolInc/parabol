import {NewMeetingPhaseTypeEnum} from '~/__generated__/RetroSidebarPhaseListItemChildren_meeting.graphql'

const isPhaseComplete = (
  phaseType: NewMeetingPhaseTypeEnum,
  phases: ReadonlyArray<{phaseType: string; stages: ReadonlyArray<{isComplete: boolean}>}>
) => {
  const phase = phases.find((p) => p.phaseType === phaseType)
  return phase ? phase.stages.every((stage) => stage && stage.isComplete === true) : true
}

export default isPhaseComplete
