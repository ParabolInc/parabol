import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
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
  const meetingMemberId = toTeamMemberId(meetingId, viewerId)
  const [meeting, viewerMeetingMember] = await Promise.all([
    dataLoader.get('newMeetings').load(meetingId),
    dataLoader.get('meetingMembers').load(meetingMemberId)
  ])
  if (!meeting) return {error: {message: 'Meeting not found'}}
  if (!viewerMeetingMember) return {error: {message: `Not a part of the meeting`}}
  const {endedAt, phases} = meeting
  if (endedAt) return {error: {message: 'Meeting already ended'}}

  // VALIDATION
  const stageRes = findStageById(phases, stageId)
  if (!stageRes) return {error: {message: 'Invalid meeting stage'}}
  const {stage} = stageRes
  stage.readyToAdvance = stage.readyToAdvance || []
  const {isNavigable, readyToAdvance} = stage

  if (!isNavigable) return {error: {message: 'Stage is not ready yet'}}

  if (isReady) {
    if (readyToAdvance.includes(viewerId)) return {error: {message: 'user is already ready'}}
    readyToAdvance.push(viewerId)
  } else {
    const userIdIdx = readyToAdvance.indexOf(viewerId)
    if (userIdIdx === -1) return {error: {message: 'user already not ready'}}
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
