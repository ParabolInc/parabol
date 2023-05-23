import GenericMeetingStage from './GenericMeetingStage'
import TeamHealthUserScore from './TeamHealthUserScore'

export default class TeamHealthStage extends GenericMeetingStage {
  phaseType!: 'TEAM_HEALTH'
  scores: TeamHealthUserScore[] = []

  constructor(public question: string, public labels: string[], durations?: number[] | undefined) {
    super({phaseType: 'TEAM_HEALTH', durations})
  }
}
