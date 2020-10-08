import {DISCUSS} from 'parabol-client/utils/constants'
import EstimateUserScore from './EstimateUserScore'
import GenericMeetingStage from './GenericMeetingStage'

interface Input {
  service: string
  serviceTaskId: string
  sortOrder: number
  durations: number[] | undefined
  dimensionId: string
  scores?: EstimateUserScore[]
}

export default class EstimateStage extends GenericMeetingStage {
  service: string
  serviceTaskId: string
  sortOrder: number
  dimensionId: string
  scores: EstimateUserScore[]
  constructor(input: Input) {
    super(DISCUSS, input.durations)
    const {service, serviceTaskId, sortOrder, dimensionId, scores} = input
    this.service = service
    this.serviceTaskId = serviceTaskId
    this.sortOrder = sortOrder
    this.dimensionId = dimensionId
    this.scores = scores || []
  }
}
