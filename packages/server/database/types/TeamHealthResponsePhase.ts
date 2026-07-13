import GenericMeetingPhase from './GenericMeetingPhase'
import TeamHealthResponseStage from './TeamHealthResponseStage'

interface Input {
  questionIds: string[]
}

export default class TeamHealthResponsePhase extends GenericMeetingPhase {
  stages: [TeamHealthResponseStage, ...TeamHealthResponseStage[]]
  phaseType = 'TEAM_HEALTH_RESPONSE' as const

  constructor(input: Input) {
    super('TEAM_HEALTH_RESPONSE')
    const {questionIds} = input
    if (questionIds.length < 1) {
      throw new Error('TeamHealthResponsePhase must have at least one question')
    }
    this.stages = questionIds.map((questionId) => new TeamHealthResponseStage({questionId})) as [
      TeamHealthResponseStage,
      ...TeamHealthResponseStage[]
    ]
  }
}
