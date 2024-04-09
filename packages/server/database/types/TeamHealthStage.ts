import GenericMeetingStage from './GenericMeetingStage'
import TeamHealthVote from './TeamHealthVote'

export default class TeamHealthStage extends GenericMeetingStage {
  phaseType!: 'TEAM_HEALTH'
  votes: TeamHealthVote[] = []
  isRevealed = false

  constructor(
    public question: string,
    public labels: string[],
    durations?: number[] | undefined
  ) {
    super({phaseType: 'TEAM_HEALTH', durations, isNavigable: true})
  }
}
