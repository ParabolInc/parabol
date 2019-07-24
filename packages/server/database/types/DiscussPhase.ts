import DiscussStage from './DiscussStage'
import GenericMeetingStage from './GenericMeetingStage'
import {DISCUSS} from '../../../client/utils/constants'
import GenericMeetingPhase from './GenericMeetingPhase'

export default class DiscussPhase extends GenericMeetingPhase {
  stages: GenericMeetingStage[]
  constructor (durations: number[] | undefined) {
    super(DISCUSS)
    this.stages = [new DiscussStage(0, durations)]
  }
}
