import {GraphQLFloat, GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getPhase from '../../utils/getPhase'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import DragEstimatingTaskPayload from '../types/DragEstimatingTaskPayload'
import {GQLContext} from '../graphql'

export default {
  description: 'Changes the priority of the estimating tasks',
  type: new GraphQLNonNull(DragEstimatingTaskPayload),
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    taskId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat)
    }
  },
  async resolve(
    _source: unknown,
    {meetingId, taskId, sortOrder}: {meetingId: string; taskId: string; sortOrder: number},
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
    const draggedStages = stages.filter((stage) => stage.taskId === taskId)
    if (!draggedStages.length) {
      return standardError(new Error('No meeting stages were found'), {userId: viewerId})
    }
    const stageIds = draggedStages.map((stage) => stage.id)

    // RESOLUTION
    // MUTATIVE
    const noise = Math.random() / 1e10
    draggedStages.forEach((stage, i) => {
      stage.sortOrder = sortOrder + noise * i
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
