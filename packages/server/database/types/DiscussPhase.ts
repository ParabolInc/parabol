import {DISCUSS} from '../../../client/utils/constants'
import DiscussStage from './DiscussStage'
import GenericMeetingPhase from './GenericMeetingPhase'

export default class DiscussPhase extends GenericMeetingPhase {
  stages: DiscussStage[]
  constructor(durations: number[] | undefined) {
    super(DISCUSS)
    this.stages = [new DiscussStage(0, durations)]
  }
}
