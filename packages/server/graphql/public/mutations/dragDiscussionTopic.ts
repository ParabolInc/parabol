import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const dragDiscussionTopic: MutationResolvers['dragDiscussionTopic'] = async (
  _source,
  {meetingId, stageId, sortOrder},
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
  const discussPhase = getPhase(phases, 'discuss')
  if (!discussPhase) {
    throw new GraphQLError('Meeting stage not found', {extensions: {code: 'NOT_FOUND'}})
  }
  const {stages} = discussPhase
  const draggedStage = stages.find((stage) => stage.id === stageId)
  if (!draggedStage) {
    throw new GraphQLError('Meeting stage not found', {extensions: {code: 'NOT_FOUND'}})
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
