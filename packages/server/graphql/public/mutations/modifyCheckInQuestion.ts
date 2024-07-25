import {getUserId, isTeamMember} from '../../../utils/authorization'

import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import publish from '../../../utils/publish'

import getRethink from '../../../database/rethinkDriver'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import {analytics} from '../../../utils/analytics/analytics'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const modifyCheckInQuestion: MutationResolvers['modifyCheckInQuestion'] = async (
  _source,
  {meetingId, checkInQuestion, modifyType},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const r = await getRethink()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)

  // AUTH
  const [meeting, viewer] = await Promise.all([
    r.table('NewMeeting').get(meetingId).run(),
    dataLoader.get('users').loadNonNull(viewerId)
  ])
  if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
  const {endedAt, teamId} = meeting
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }

  if (meeting.facilitatorUserId !== viewerId) {
    return standardError(new Error('Nice try!'), {userId: viewerId})
  }

  if (endedAt) {
    return standardError(new Error('Meeting has already ended'), {userId: viewerId})
  }

  const openai = new OpenAIServerManager()
  const modifiedCheckInQuestion = await openai.modifyCheckInQuestion(checkInQuestion, modifyType)

  analytics.icebreakerModified(viewer, meetingId, modifyType, modifiedCheckInQuestion !== null)

  // RESOLUTION
  const data = {modifiedCheckInQuestion}
  publish(SubscriptionChannel.MEETING, meetingId, 'ModifyCheckInQuestionSuccess', data, subOptions)
  return data
}

export default modifyCheckInQuestion
