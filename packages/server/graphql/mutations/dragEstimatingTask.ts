import {GraphQLFloat, GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql'
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
    stageIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID)))
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat)
    }
  },
  async resolve(
    _source: unknown,
    {meetingId, stageIds, sortOrder}: {meetingId: string; stageIds: string[]; sortOrder: number},
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
    const draggedStages = stages.filter((stage) => stageIds.includes(stage.id))
    if (!draggedStages.length) {
      return standardError(new Error('No meeting stages were found'), {userId: viewerId})
    }

    // RESOLUTION
    // MUTATIVE
    draggedStages.forEach((draggedStage) => (draggedStage.sortOrder = sortOrder))
    stages.sort((a, b) => {
      if (a.sortOrder > b.sortOrder) {
        return 1
      } else if (a.sortOrder === b.sortOrder) {
        return a.dimensionRefIdx > b.dimensionRefIdx ? 1 : -1
      } else {
        return -1
      }
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
