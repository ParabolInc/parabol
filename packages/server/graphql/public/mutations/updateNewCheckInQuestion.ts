import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {makeCheckinQuestion} from 'parabol-client/utils/makeCheckinGreeting'
import {plaintextToTipTap} from '../../../../client/shared/tiptap/plaintextToTipTap'
import getKysely from '../../../postgres/getKysely'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const updateNewCheckInQuestion: MutationResolvers['updateNewCheckInQuestion'] = async (
  _source,
  {meetingId, checkInQuestion},
  {dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
  const {endedAt, phases, teamId} = meeting
  if (endedAt) throw new GraphQLError('Meeting has already ended', {extensions: {code: 'CONFLICT'}})

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
