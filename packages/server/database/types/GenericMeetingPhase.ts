import {NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'
import shortid from 'shortid'
import GenericMeetingStage from './GenericMeetingStage'

export default class GenericMeetingPhase {
  id = shortid.generate()
  stages: GenericMeetingStage[]
  constructor(public phaseType: NewMeetingPhaseTypeEnum, durations?: number[] | undefined) {
    this.stages = [new GenericMeetingStage(phaseType, durations)]
  }
}
