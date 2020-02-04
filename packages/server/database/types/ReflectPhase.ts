import GenericMeetingPhase from './GenericMeetingPhase'
import GenericMeetingStage from './GenericMeetingStage'
import {REFLECT} from '../../../client/utils/constants'

export default class ReflectPhase extends GenericMeetingPhase {
  stages: GenericMeetingStage[]
  focusedPhaseItemId?: string

  constructor(
    public teamId: string,
    public promptTemplateId: string,
    durations: number[] | undefined
  ) {
    super(REFLECT)
    this.stages = [new GenericMeetingStage(REFLECT, durations)]
  }
}
