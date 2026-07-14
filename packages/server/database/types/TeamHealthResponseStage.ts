import GenericMeetingStage, {type GenericMeetingStageInput} from './GenericMeetingStage'

interface Input extends Omit<GenericMeetingStageInput, 'phaseType'> {
  // questions are immutable, so referencing the id is safe: editing a question after the
  // meeting creates a brand new question rather than mutating this one
  questionId: string
}

export default class TeamHealthResponseStage extends GenericMeetingStage {
  questionId: string
  phaseType = 'TEAM_HEALTH_RESPONSE' as const
  constructor(input: Input) {
    super({...input, phaseType: 'TEAM_HEALTH_RESPONSE', isNavigable: true})
    this.questionId = input.questionId
  }
}
