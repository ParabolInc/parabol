import GenericMeetingStage from './GenericMeetingStage'

export default class TeamHealthIntroStage extends GenericMeetingStage {
  phaseType = 'TEAM_HEALTH_INTRO' as const
  constructor() {
    // async meeting: everyone (including the owner/facilitator) self-navigates freely
    super({phaseType: 'TEAM_HEALTH_INTRO', isNavigable: true, isNavigableByFacilitator: true})
  }
}
