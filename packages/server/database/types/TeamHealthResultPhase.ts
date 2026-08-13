import GenericMeetingPhase from './GenericMeetingPhase'
import TeamHealthResultStage from './TeamHealthResultStage'

export default class TeamHealthResultPhase extends GenericMeetingPhase {
  stages: [TeamHealthResultStage]
  phaseType = 'TEAM_HEALTH_RESULT' as const

  constructor() {
    super('TEAM_HEALTH_RESULT')
    this.stages = [new TeamHealthResultStage()]
  }
}
