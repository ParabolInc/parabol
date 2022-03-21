import GenericMeetingPhase from './GenericMeetingPhase'
import TeamPromptResponseStage from './TeamPromptResponseStage'

export default class TeamPromptResponsesPhase extends GenericMeetingPhase {
  stages: TeamPromptResponseStage[]
  phaseType!: 'RESPONSES'

  constructor(teamMemberIds: string[]) {
    super('RESPONSES')
    this.stages = teamMemberIds.map((teamMemberId) => new TeamPromptResponseStage({teamMemberId}))
  }
}
