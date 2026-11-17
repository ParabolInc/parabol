import GenericMeetingPhase from './GenericMeetingPhase'
import TeamHealthIntroStage from './TeamHealthIntroStage'

export default class TeamHealthIntroPhase extends GenericMeetingPhase {
  stages: [TeamHealthIntroStage]
  phaseType = 'TEAM_HEALTH_INTRO' as const

  constructor() {
    super('TEAM_HEALTH_INTRO')
    this.stages = [new TeamHealthIntroStage()]
  }
}
