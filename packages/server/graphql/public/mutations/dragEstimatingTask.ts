import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {ESTIMATE_TASK_SORT_ORDER} from '../../../../client/utils/constants'
import getKysely from '../../../postgres/getKysely'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const dragEstimatingTask: MutationResolvers['dragEstimatingTask'] = async (
  _source,
  {meetingId, taskId, newPositionIndex},
  {dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  // AUTH
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
  const {endedAt, phases} = meeting
  if (endedAt) throw new GraphQLError('Meeting already ended', {extensions: {code: 'CONFLICT'}})
  const estimatePhase = getPhase(phases, 'ESTIMATE')
  if (!estimatePhase) {
    throw new GraphQLError('Meeting phase not found', {extensions: {code: 'NOT_FOUND'}})
  }
  const {stages} = estimatePhase
  const taskIds = stages.map(({taskId}) => taskId)
  const numberOfTasks = new Set(taskIds).size
  if (newPositionIndex < 0 || newPositionIndex >= numberOfTasks) {
    throw new GraphQLError('Invalid position index', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  const draggedStages = stages.filter((stage) => stage.taskId === taskId)
  if (!draggedStages.length) {
    throw new GraphQLError('No meeting stages were found', {extensions: {code: 'NOT_FOUND'}})
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
  await pg
    .updateTable('NewMeeting')
    .set({phases: JSON.stringify(phases)})
    .where('id', '=', meetingId)
    .execute()
  dataLoader.clearAll('newMeetings')
  const data = {meetingId, stageIds}
  publish(SubscriptionChannel.MEETING, meetingId, 'DragEstimatingTaskSuccess', data, subOptions)
  return data
}

export default dragEstimatingTask
