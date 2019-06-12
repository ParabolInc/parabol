import DiscussStage from 'server/database/types/DiscussStage'
import GenericMeetingStage from 'server/database/types/GenericMeetingStage'
import {DISCUSS} from 'universal/utils/constants'
import GenericMeetingPhase from './GenericMeetingPhase'

export default class DiscussPhase extends GenericMeetingPhase {
  stages: GenericMeetingStage[]
  constructor (durations: number[] | undefined) {
    super(DISCUSS)
    this.stages = [new DiscussStage(0, durations)]
  }
}
