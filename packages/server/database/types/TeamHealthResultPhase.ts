import GenericMeetingPhase from './GenericMeetingPhase'
import TeamHealthResultStage from './TeamHealthResultStage'

interface Input {
  questions: {questionId: number; discussionId: string}[]
}

export default class TeamHealthResultPhase extends GenericMeetingPhase {
  stages: [TeamHealthResultStage, ...TeamHealthResultStage[]]
  phaseType = 'TEAM_HEALTH_RESULT' as const

  constructor(input: Input) {
    super('TEAM_HEALTH_RESULT')
    const {questions} = input
    if (questions.length < 1) {
      throw new Error('TeamHealthResultPhase must have at least one question')
    }
    // one stage per category, in question order. Ending the meeting reveals the results and
    // reorders them by urgency (see sortTeamHealthResultStages), after which anyone can drag them
    this.stages = questions.map(
      (question, sortOrder) => new TeamHealthResultStage({...question, sortOrder})
    ) as [TeamHealthResultStage, ...TeamHealthResultStage[]]
  }
}
