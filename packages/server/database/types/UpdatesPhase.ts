import GenericMeetingPhase from './GenericMeetingPhase'
import UpdatesStage from './UpdatesStage'

interface Input {
  durations: number[] | undefined
  stages: [UpdatesStage, ...UpdatesStage[]]
}
export default class UpdatesPhase extends GenericMeetingPhase {
  stages: [UpdatesStage, ...UpdatesStage[]]
  durations: number[] | undefined
  phaseType!: 'updates'
  constructor(input: Input) {
    super('updates')
    const {durations, stages} = input
    this.durations = durations
    this.stages = stages
  }
}
