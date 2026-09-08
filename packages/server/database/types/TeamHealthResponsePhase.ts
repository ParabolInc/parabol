import GenericMeetingPhase from './GenericMeetingPhase'
import TeamHealthResponseStage from './TeamHealthResponseStage'

interface Input {
  questions: {questionId: number; discussionId: string}[]
}

export default class TeamHealthResponsePhase extends GenericMeetingPhase {
  stages: [TeamHealthResponseStage, ...TeamHealthResponseStage[]]
  phaseType = 'TEAM_HEALTH_RESPONSE' as const

  constructor(input: Input) {
    super('TEAM_HEALTH_RESPONSE')
    const {questions} = input
    if (questions.length < 1) {
      throw new Error('TeamHealthResponsePhase must have at least one question')
    }
    this.stages = questions.map((question) => new TeamHealthResponseStage(question)) as [
      TeamHealthResponseStage,
      ...TeamHealthResponseStage[]
    ]
  }
}
