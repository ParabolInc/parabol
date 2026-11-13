import {positionAfter} from '../../../client/shared/sortOrder'
import GenericMeetingPhase from './GenericMeetingPhase'
import TeamPromptResponseStage from './TeamPromptResponseStage'

export default class TeamPromptResponsesPhase extends GenericMeetingPhase {
  stages: [TeamPromptResponseStage, ...TeamPromptResponseStage[]]
  phaseType = 'RESPONSES' as const

  constructor(teamMemberIds: string[]) {
    super('RESPONSES')
    if (teamMemberIds.length < 1) {
      throw new Error('TeamPromptResponsesPhase must have at least one team member')
    }
    let sortOrder = ''
    this.stages = teamMemberIds.map((teamMemberId) => {
      sortOrder = positionAfter(sortOrder)
      return new TeamPromptResponseStage({teamMemberId, sortOrder})
    }) as [TeamPromptResponseStage, ...TeamPromptResponseStage[]]
  }
}
