import {NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'
import generateUID from '../../generateUID'
import GenericMeetingStage from './GenericMeetingStage'

export default class GenericMeetingPhase {
  id = generateUID()
  stages: GenericMeetingStage[]
  constructor(public phaseType: NewMeetingPhaseTypeEnum, durations?: number[] | undefined) {
    this.stages = [new GenericMeetingStage(phaseType, durations)]
  }
}
