import GenericMeetingPhase from './GenericMeetingPhase'
import type UpdatesStage from './UpdatesStage'

interface Input {
  durations: number[] | undefined
  stages: [UpdatesStage, ...UpdatesStage[]]
}
export default class UpdatesPhase extends GenericMeetingPhase {
  stages: [UpdatesStage, ...UpdatesStage[]]
  durations: number[] | undefined
  phaseType = 'updates' as const
  constructor(input: Input) {
    super('updates')
    const {durations, stages} = input
    this.durations = durations
    this.stages = stages
  }
}
