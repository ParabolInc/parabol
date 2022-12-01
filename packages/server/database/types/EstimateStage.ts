import generateUID from '../../generateUID'
import EstimateUserScore from './EstimateUserScore'
import GenericMeetingStage, {GenericMeetingStageInput} from './GenericMeetingStage'

interface Input extends Omit<GenericMeetingStageInput, 'phaseType'> {
  creatorUserId: string
  taskId: string
  serviceTaskId: string
  sortOrder: number
  durations: number[] | undefined
  dimensionRefIdx: number
  scores?: EstimateUserScore[]
  finalScore?: number
  discussionId?: string
}

export default class EstimateStage extends GenericMeetingStage {
  creatorUserId: string
  serviceTaskId: string
  taskId: string
  sortOrder: number
  dimensionRefIdx: number
  finalScore?: number
  scores: EstimateUserScore[]
  isVoting: boolean
  discussionId: string
  phaseType!: 'ESTIMATE'
  constructor(input: Input) {
    super({phaseType: 'ESTIMATE', durations: input.durations})
    const {creatorUserId, serviceTaskId, sortOrder, scores, dimensionRefIdx, discussionId, taskId} =
      input
    this.creatorUserId = creatorUserId
    this.serviceTaskId = serviceTaskId
    this.sortOrder = sortOrder
    this.scores = scores || []
    this.taskId = taskId
    this.isNavigable = true
    this.isNavigableByFacilitator = true
    this.isVoting = true
    this.dimensionRefIdx = dimensionRefIdx
    this.discussionId = discussionId ?? generateUID()
  }
}
