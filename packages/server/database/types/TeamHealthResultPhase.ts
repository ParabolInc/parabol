import GenericMeetingPhase from './GenericMeetingPhase'
import TeamHealthResultStage from './TeamHealthResultStage'

interface Input {
  questionIds: number[]
}

export default class TeamHealthResultPhase extends GenericMeetingPhase {
  stages: [TeamHealthResultStage, ...TeamHealthResultStage[]]
  phaseType = 'TEAM_HEALTH_RESULT' as const

  constructor(input: Input) {
    super('TEAM_HEALTH_RESULT')
    const {questionIds} = input
    if (questionIds.length < 1) {
      throw new Error('TeamHealthResultPhase must have at least one question')
    }
    // one stage per category, in question order. Ending the meeting reveals the results and
    // reorders them by urgency (see sortTeamHealthResultStages), after which anyone can drag them
    this.stages = questionIds.map(
      (questionId, sortOrder) => new TeamHealthResultStage({questionId, sortOrder})
    ) as [
      TeamHealthResultStage,
      ...TeamHealthResultStage[]
    ]
  }
}
