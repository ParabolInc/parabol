import DiscussStage from './DiscussStage'
import GenericMeetingPhase from './GenericMeetingPhase'

export default class DiscussPhase extends GenericMeetingPhase {
  stages: [DiscussStage, ...DiscussStage[]]
  constructor(durations: number[] | undefined) {
    super('discuss')
    this.stages = [new DiscussStage({sortOrder: 0, durations, reflectionGroupId: ''})]
  }
}
