const UNSTARTED_MEETING = {
  id: '',
  facilitatorUserId: '',
  facilitatorStageId: '',
  phases: [],
  localPhase: null,
  localStage: null
}

export interface UnstartedMeeting {
  facilitatorUserId: string
  facilitatorStageId: string
  phases: Array<never>
  localPhase: null
  localStage: null
}

export default UNSTARTED_MEETING
