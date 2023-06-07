import TeamHealthStage from './TeamHealthStage'
import GenericMeetingPhase from './GenericMeetingPhase'

interface Input {
  stages: [TeamHealthStage, ...TeamHealthStage[]]
}
export default class TeamHealthPhase extends GenericMeetingPhase {
  stages: [TeamHealthStage, ...TeamHealthStage[]]
  phaseType!: 'TEAM_HEALTH'
  isRevealed = false

  constructor(input: Input) {
    super('TEAM_HEALTH')
    const {stages} = input
    this.stages = stages
  }
}
