import {DISCUSS} from 'parabol-client/utils/constants'
import GenericMeetingStage from './GenericMeetingStage'

interface Input {
  taskId: string
  sortOrder: number
  durations: number[] | undefined
}

export default class EstimateStage extends GenericMeetingStage {
  taskId: string
  sortOrder: number
  constructor(input: Input) {
    super(DISCUSS, input.durations)
    const {taskId, sortOrder} = input
    this.taskId = taskId
    this.sortOrder = sortOrder
  }
}
