import generateUID from '../../generateUID'
import type {Newmeetingphasetypeenum} from '../../postgres/types/pg'
import GenericMeetingStage from './GenericMeetingStage'

export default class GenericMeetingPhase {
  id = generateUID()
  stages: GenericMeetingStage[]
  constructor(
    public phaseType: Newmeetingphasetypeenum,
    durations?: number[] | undefined
  ) {
    this.stages = [new GenericMeetingStage({phaseType, durations})]
  }
}
