const UNSTARTED_MEETING = {
  id: '',
  facilitatorUserId: '',
  facilitatorStageId: '',
  phases: [],
  localPhase: null,
  localStage: null
} as UnstartedMeeting

export interface UnstartedMeeting {
  id: string
  facilitatorUserId: string
  facilitatorStageId: string
  phases: ReadonlyArray<any>
  localPhase: null
  localStage: null
}

export default UNSTARTED_MEETING
