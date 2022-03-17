import {GraphQLID, GraphQLInt, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getPhase from '../../utils/getPhase'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import DragEstimatingTaskPayload from '../types/DragEstimatingTaskPayload'
import {GQLContext} from '../graphql'
import {ESTIMATE_TASK_SORT_ORDER} from '../../../client/utils/constants'

export default {
  description: 'Changes the ordering of the estimating tasks',
  type: new GraphQLNonNull(DragEstimatingTaskPayload),
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    taskId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    newPositionIndex: {
      description:
        'The index of the tasks will be moved to, in the list of estimating tasks sidebar section',
      type: new GraphQLNonNull(GraphQLInt)
    }
  },
  async resolve(
    _source: unknown,
    {
      meetingId,
      taskId,
      newPositionIndex
    }: {meetingId: string; taskId: string; newPositionIndex: number},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const viewerId = getUserId(authToken)

    // AUTH
    const meeting = await r.table('NewMeeting').get(meetingId).run()
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {endedAt, phases, teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Not on team'), {userId: viewerId})
    }
    if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})
    const estimatePhase = getPhase(phases, 'ESTIMATE')
    if (!estimatePhase) {
      return standardError(new Error('Meeting phase not found'), {userId: viewerId})
    }
    const {stages} = estimatePhase
    const taskIds = stages.map(({taskId}) => taskId)
    const numberOfTasks = new Set(taskIds).size
    if (newPositionIndex < 0 || newPositionIndex >= numberOfTasks) {
      return standardError(new Error('Invalid position index'), {userId: viewerId})
    }
    const draggedStages = stages.filter((stage) => stage.taskId === taskId)
    if (!draggedStages.length) {
      return standardError(new Error('No meeting stages were found'), {userId: viewerId})
    }
    const stageIds = draggedStages.map((stage) => stage.id)

    // RESOLUTION
    // MUTATIVE
    const numberOfDimensions = Math.floor(stages.length / numberOfTasks)
    const oldPositionIndex = taskIds.indexOf(taskId) / numberOfDimensions
    let sortOrder: number
    if (newPositionIndex === 0) {
      sortOrder = stages[0]!.sortOrder - ESTIMATE_TASK_SORT_ORDER
    } else if (newPositionIndex === numberOfTasks - 1) {
      sortOrder = stages[stages.length - 1]!.sortOrder + ESTIMATE_TASK_SORT_ORDER
    } else {
      const offSet = oldPositionIndex > newPositionIndex ? 0 : 1
      const prevStage = stages[(newPositionIndex + offSet) * numberOfDimensions - 1]!
      const nextStage = stages[(newPositionIndex + offSet) * numberOfDimensions]!
      sortOrder = Math.floor((prevStage.sortOrder + nextStage.sortOrder) / 2)
    }
    draggedStages.forEach((stage, i) => {
      stage.sortOrder = sortOrder + i
    })

    stages.sort((a, b) => {
      return a.sortOrder > b.sortOrder ? 1 : -1
    })
    await r
      .table('NewMeeting')
      .get(meetingId)
      .update({
        phases
      })
      .run()

    const data = {
      meetingId,
      stageIds
    }
    publish(SubscriptionChannel.MEETING, meetingId, 'DragEstimatingTaskSuccess', data, subOptions)
    return data
  }
}
