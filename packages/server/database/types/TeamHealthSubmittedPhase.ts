import GenericMeetingPhase from './GenericMeetingPhase'
import TeamHealthSubmittedStage from './TeamHealthSubmittedStage'

export default class TeamHealthSubmittedPhase extends GenericMeetingPhase {
  stages: [TeamHealthSubmittedStage]
  phaseType = 'TEAM_HEALTH_SUBMITTED' as const

  constructor() {
    super('TEAM_HEALTH_SUBMITTED')
    this.stages = [new TeamHealthSubmittedStage()]
  }
}
