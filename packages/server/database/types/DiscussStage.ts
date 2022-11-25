import generateUID from '../../generateUID'
import GenericMeetingStage, {GenericMeetingStageInput} from './GenericMeetingStage'

interface Input extends Omit<GenericMeetingStageInput, 'phaseType'> {
  sortOrder: number
  discussionId?: string
  reflectionGroupId: string
  topicSummary?: string
}
export default class DiscussStage extends GenericMeetingStage {
  reflectionGroupId: string
  discussionId: string
  sortOrder: number
  topicSummary?: string
  phaseType!: 'discuss'
  constructor(input: Input) {
    const {sortOrder, discussionId, reflectionGroupId, topicSummary} = input
    super({...input, phaseType: 'discuss'})
    this.sortOrder = sortOrder
    this.discussionId = discussionId ?? generateUID()
    this.reflectionGroupId = reflectionGroupId
    this.topicSummary = topicSummary
  }
}
