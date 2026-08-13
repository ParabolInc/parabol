import GenericMeetingStage from './GenericMeetingStage'

export default class TeamHealthSubmittedStage extends GenericMeetingStage {
  phaseType = 'TEAM_HEALTH_SUBMITTED' as const
  constructor() {
    // async meeting: everyone (including the owner/facilitator) self-navigates freely
    super({phaseType: 'TEAM_HEALTH_SUBMITTED', isNavigable: true, isNavigableByFacilitator: true})
  }
}
