import GenericMeetingStage, {type GenericMeetingStageInput} from './GenericMeetingStage'

interface Input extends Omit<GenericMeetingStageInput, 'phaseType'> {
  // the question asked this cycle. Its category is what the stage discusses, since the question
  // rotates between cycles while the category is the thing the team tracks over time
  questionId: number
  sortOrder: number
  // one Discussion per question, shared with the response stage for the same question
  discussionId: string
}

export default class TeamHealthResultStage extends GenericMeetingStage {
  questionId: number
  sortOrder: number
  discussionId: string
  phaseType = 'TEAM_HEALTH_RESULT' as const
  constructor(input: Input) {
    // async meeting: everyone (including the owner/facilitator) self-navigates freely. Before the
    // meeting ends these stages are the "you're all set" waiting room, after it, the results
    super({
      ...input,
      phaseType: 'TEAM_HEALTH_RESULT',
      isNavigable: true,
      isNavigableByFacilitator: true
    })
    this.questionId = input.questionId
    this.sortOrder = input.sortOrder
    this.discussionId = input.discussionId
  }
}
