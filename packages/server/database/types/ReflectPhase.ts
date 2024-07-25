import {REFLECT} from 'parabol-client/utils/constants'
import GenericMeetingPhase from './GenericMeetingPhase'
import GenericMeetingStage from './GenericMeetingStage'

export default class ReflectPhase extends GenericMeetingPhase {
  stages: [GenericMeetingStage, ...GenericMeetingStage[]]
  focusedPromptId?: string

  constructor(
    public teamId: string,
    durations: number[] | undefined
  ) {
    super('reflect')
    this.stages = [
      new GenericMeetingStage({
        phaseType: REFLECT,
        durations,
        isNavigable: true,
        isNavigableByFacilitator: true
      })
    ]
  }
}
