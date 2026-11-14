import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const flagReadyToAdvance: MutationResolvers['flagReadyToAdvance'] = async (
  _source,
  {meetingId, stageId, isReady},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
  const {endedAt, phases} = meeting
  if (endedAt) throw new GraphQLError('Meeting already ended', {extensions: {code: 'CONFLICT'}})

  // VALIDATION
  const stageRes = findStageById(phases, stageId)
  if (!stageRes)
    throw new GraphQLError('Invalid meeting stage', {extensions: {code: 'BAD_USER_INPUT'}})
  const {stage} = stageRes
  stage.readyToAdvance = stage.readyToAdvance || []
  const {isNavigable, readyToAdvance} = stage

  if (!isNavigable)
    throw new GraphQLError('Stage is not ready yet', {extensions: {code: 'CONFLICT'}})

  if (isReady) {
    if (readyToAdvance.includes(viewerId))
      throw new GraphQLError('user is already ready', {extensions: {code: 'CONFLICT'}})
    readyToAdvance.push(viewerId)
  } else {
    const userIdIdx = readyToAdvance.indexOf(viewerId)
    if (userIdIdx === -1)
      throw new GraphQLError('user already not ready', {extensions: {code: 'CONFLICT'}})
    readyToAdvance.splice(userIdIdx, 1)
  }

  // RESOLUTION
  await pg
    .updateTable('NewMeeting')
    .set({phases: JSON.stringify(phases)})
    .where('id', '=', meetingId)
    .execute()
  dataLoader.clearAll('newMeetings')
  const data = {meetingId, stageId}
  publish(SubscriptionChannel.MEETING, meetingId, 'FlagReadyToAdvanceSuccess', data, subOptions)
  return data
}

export default flagReadyToAdvance
