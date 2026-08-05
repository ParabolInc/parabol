import GenericMeetingStage from './GenericMeetingStage'

export default class TeamHealthResultStage extends GenericMeetingStage {
  phaseType = 'TEAM_HEALTH_RESULT' as const
  constructor() {
    // not navigable until the results are revealed; ending the meeting flips this
    super({phaseType: 'TEAM_HEALTH_RESULT', isNavigable: false})
  }
}
