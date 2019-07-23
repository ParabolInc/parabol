import GenericMeetingStage from 'server/database/types/GenericMeetingStage'
import shortid from 'shortid'

export default class GenericMeetingPhase {
  id = shortid.generate()
  stages: GenericMeetingStage[]
  constructor (public phaseType: string, durations?: number[] | undefined) {
    this.stages = [new GenericMeetingStage(phaseType, durations)]
  }
}
