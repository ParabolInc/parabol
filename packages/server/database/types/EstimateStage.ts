import {DISCUSS} from 'parabol-client/utils/constants'
import GenericMeetingStage from './GenericMeetingStage'

interface Input {
  service: string
  serviceTaskId: string
  sortOrder: number
  durations: number[] | undefined
}

export default class EstimateStage extends GenericMeetingStage {
  service: string
  serviceTaskId: string
  sortOrder: number
  constructor(input: Input) {
    super(DISCUSS, input.durations)
    const {service, serviceTaskId, sortOrder} = input
    this.service = service
    this.serviceTaskId = serviceTaskId
    this.sortOrder = sortOrder
  }
}
