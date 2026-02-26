import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {makeCheckinQuestion} from 'parabol-client/utils/makeCheckinGreeting'
import {plaintextToTipTap} from '../../../../client/shared/tiptap/plaintextToTipTap'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const updateNewCheckInQuestion: MutationResolvers['updateNewCheckInQuestion'] = async (
  _source,
  {meetingId, checkInQuestion},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)

  // AUTH
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
  const {endedAt, phases, teamId} = meeting
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }
  if (endedAt) return {error: {message: 'Meeting has already ended'}}

  // VALIDATION
  const normalizedCheckInQuestion =
    checkInQuestion ||
    JSON.stringify(plaintextToTipTap(makeCheckinQuestion(Math.floor(Math.random() * 1000), teamId)))

  // RESOLUTION
  const checkInPhase = getPhase(phases, 'checkin')
  checkInPhase.checkInQuestion = normalizedCheckInQuestion
  await pg
    .updateTable('NewMeeting')
    .set({phases: JSON.stringify(phases)})
    .where('id', '=', meetingId)
    .execute()
  dataLoader.clearAll('newMeetings')
  const data = {meetingId}
  publish(
    SubscriptionChannel.MEETING,
    meetingId,
    'UpdateNewCheckInQuestionPayload',
    data,
    subOptions
  )
  return data
}

export default updateNewCheckInQuestion
