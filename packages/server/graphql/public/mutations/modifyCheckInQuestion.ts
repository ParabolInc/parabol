import {getUserId, isTeamMember} from '../../../utils/authorization'

import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import publish from '../../../utils/publish'

import {MutationResolvers} from '../resolverTypes'
import convertToTaskContent from 'parabol-client/utils/draftjs/convertToTaskContent'
import getRethink from '../../../database/rethinkDriver'
import getPhase from '../../../utils/getPhase'
import standardError from '../../../utils/standardError'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'

const modifyCheckInQuestion: MutationResolvers['modifyCheckInQuestion'] = async (
  _source,
  {meetingId, checkInQuestion, modifyType},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const r = await getRethink()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const now = new Date()
  const viewerId = getUserId(authToken)

  // AUTH
  const meeting = await r.table('NewMeeting').get(meetingId).run()
  if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
  const {endedAt, phases, teamId} = meeting
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }

  if (endedAt) {
    return {error: {message: 'Meeting has already ended'}}
  }

  // RESOLUTION
  const checkInPhase = getPhase(phases, 'checkin')

  // mutative

  const openai = new OpenAIServerManager()
  const modifiedCheckInQuestion = await openai.modifyCheckInQuestion(checkInQuestion, modifyType)

  checkInPhase.checkInQuestion = convertToTaskContent(
    modifiedCheckInQuestion ? modifiedCheckInQuestion : checkInQuestion
  )

  await r
    .table('NewMeeting')
    .get(meetingId)
    .update({
      phases,
      updatedAt: now
    })
    .run()

  // RESOLUTION
  const data = {meetingId}
  publish(SubscriptionChannel.MEETING, meetingId, 'ModifyCheckInQuestionSuccess', data, subOptions)
  return data
}

export default modifyCheckInQuestion
