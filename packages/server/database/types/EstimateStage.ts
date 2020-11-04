import {NewMeetingPhaseTypeEnum} from '../../../client/types/graphql'
import EstimateUserScore from './EstimateUserScore'
import GenericMeetingStage from './GenericMeetingStage'

interface Input {
  creatorUserId: string
  service: string
  serviceTaskId: string
  sortOrder: number
  durations: number[] | undefined
  dimensionId: string
  scores?: EstimateUserScore[]
  finalScore?: number
}

export default class EstimateStage extends GenericMeetingStage {
  creatorUserId: string
  service: string
  serviceTaskId: string
  sortOrder: number
  dimensionId: string
  finalScore?: number
  scores: EstimateUserScore[]
  isVoting: boolean
  constructor(input: Input) {
    super(NewMeetingPhaseTypeEnum.ESTIMATE, input.durations)
    const {creatorUserId, service, serviceTaskId, sortOrder, dimensionId, scores} = input
    this.creatorUserId = creatorUserId
    this.service = service
    this.serviceTaskId = serviceTaskId
    this.sortOrder = sortOrder
    this.dimensionId = dimensionId
    this.scores = scores || []
    this.isNavigable = true
    this.isNavigableByFacilitator = true
    this.isVoting = true
  }
}
