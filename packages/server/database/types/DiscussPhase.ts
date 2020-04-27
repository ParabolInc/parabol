import {NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'
import DiscussStage from './DiscussStage'
import GenericMeetingPhase from './GenericMeetingPhase'

export default class DiscussPhase extends GenericMeetingPhase {
  stages: DiscussStage[]
  constructor(durations: number[] | undefined) {
    super(NewMeetingPhaseTypeEnum.discuss)
    this.stages = [new DiscussStage(0, durations)]
  }
}
