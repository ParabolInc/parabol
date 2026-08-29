import GenericMeetingStage from './GenericMeetingStage'

export default class TeamHealthResultStage extends GenericMeetingStage {
  phaseType = 'TEAM_HEALTH_RESULT' as const
  constructor() {
    // async meeting: everyone (including the owner/facilitator) self-navigates freely. Before the
    // meeting ends this stage is the "you're all set" waiting room, after it, the results
    super({phaseType: 'TEAM_HEALTH_RESULT', isNavigable: true, isNavigableByFacilitator: true})
  }
}
