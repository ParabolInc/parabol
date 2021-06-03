import {DISCUSS} from 'parabol-client/utils/constants'
import generateUID from '../../generateUID'
import GenericMeetingStage, {GenericMeetingStageInput} from './GenericMeetingStage'

interface Input extends Omit<GenericMeetingStageInput, 'phaseType'> {
  sortOrder: number
  threadId?: string
  reflectionGroupId: string
}
export default class DiscussStage extends GenericMeetingStage {
  reflectionGroupId: string
  threadId: string
  sortOrder: number
  constructor(input: Input) {
    const {sortOrder, threadId, reflectionGroupId} = input
    super({...input, phaseType: DISCUSS})
    this.sortOrder = sortOrder
    this.threadId = threadId ?? generateUID()
    this.reflectionGroupId = reflectionGroupId
  }
}
