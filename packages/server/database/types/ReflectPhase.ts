import GenericMeetingPhase from 'server/database/types/GenericMeetingPhase'
import GenericMeetingStage from 'server/database/types/GenericMeetingStage'
import {REFLECT} from 'universal/utils/constants'

export default class ReflectPhase extends GenericMeetingPhase {
  stages: GenericMeetingStage[]

  constructor (
    public teamId: string,
    public promptTemplateId: string,
    durations: number[] | undefined
  ) {
    super(REFLECT)
    this.stages = [new GenericMeetingStage(REFLECT, durations)]
  }
}
