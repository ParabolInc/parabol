import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const dragDiscussionTopic: MutationResolvers['dragDiscussionTopic'] = async (
  _source,
  {meetingId, stageId, sortOrder},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const viewerId = getUserId(authToken)

  // AUTH
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
  const {endedAt, phases, teamId} = meeting
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }
  if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})
  const discussPhase = getPhase(phases, 'discuss')
  if (!discussPhase) {
    return standardError(new Error('Meeting stage not found'), {userId: viewerId})
  }
  const {stages} = discussPhase
  const draggedStage = stages.find((stage) => stage.id === stageId)
  if (!draggedStage) {
    return standardError(new Error('Meeting stage not found'), {userId: viewerId})
  }

  // RESOLUTION
  // MUTATIVE
  draggedStage.sortOrder = sortOrder
  stages.sort((a, b) => {
    return a.sortOrder > b.sortOrder ? 1 : -1
  })
  await pg
    .updateTable('NewMeeting')
    .set({phases: JSON.stringify(phases)})
    .where('id', '=', meetingId)
    .execute()
  dataLoader.clearAll('newMeetings')
  const data = {meetingId, stageId}
  publish(SubscriptionChannel.MEETING, meetingId, 'DragDiscussionTopicPayload', data, subOptions)
  return data
}

export default dragDiscussionTopic
