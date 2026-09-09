import GenericMeetingStage, {type GenericMeetingStageInput} from './GenericMeetingStage'

interface Input extends Omit<GenericMeetingStageInput, 'phaseType'> {
  // questions are immutable, so referencing the id is safe: editing a question after the
  // meeting creates a brand new question rather than mutating this one
  questionId: number
  // one Discussion per question, shared with the result stage for the same question
  discussionId: string
}

export default class TeamHealthResponseStage extends GenericMeetingStage {
  questionId: number
  discussionId: string
  phaseType = 'TEAM_HEALTH_RESPONSE' as const
  constructor(input: Input) {
    // async meeting: everyone (including the owner/facilitator) self-navigates freely
    super({
      ...input,
      phaseType: 'TEAM_HEALTH_RESPONSE',
      isNavigable: true,
      isNavigableByFacilitator: true
    })
    this.questionId = input.questionId
    this.discussionId = input.discussionId
  }
}
