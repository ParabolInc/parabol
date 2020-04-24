import GenericMeetingStage from './GenericMeetingStage'
import shortid from 'shortid'
import {NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'

export default class GenericMeetingPhase {
  id = shortid.generate()
  stages: GenericMeetingStage[]
  constructor(public phaseType: NewMeetingPhaseTypeEnum, durations?: number[] | undefined) {
    this.stages = [new GenericMeetingStage(phaseType, durations)]
  }
}
