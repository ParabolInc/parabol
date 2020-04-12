import GenericMeetingPhase from './GenericMeetingPhase'
import GenericMeetingStage from './GenericMeetingStage'
import {REFLECT} from 'parabol-client/src/utils/constants'
import {NewMeetingPhaseTypeEnum} from 'parabol-client/src/types/graphql'

export default class ReflectPhase extends GenericMeetingPhase {
  stages: GenericMeetingStage[]
  focusedPhaseItemId?: string

  constructor(
    public teamId: string,
    public promptTemplateId: string,
    durations: number[] | undefined
  ) {
    super(NewMeetingPhaseTypeEnum.reflect)
    this.stages = [new GenericMeetingStage(REFLECT, durations)]
  }
}
