import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {icebreakerRewrites} from '../../../metricsHandler'
import {getUserId} from '../../../utils/authorization'

import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const modifyCheckInQuestion: MutationResolvers['modifyCheckInQuestion'] = async (
  _source,
  {meetingId, checkInQuestion, modifyType},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)

  // AUTH
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting)
    return standardError(new Error('Meeting not found'), {
      userId: viewerId
    })
  const {endedAt} = meeting

  if (endedAt) {
    return standardError(new Error('Meeting has already ended'), {
      userId: viewerId
    })
  }

  const openai = new OpenAIServerManager()
  const modifiedCheckInQuestion = await openai.modifyCheckInQuestion(checkInQuestion, modifyType)

  icebreakerRewrites.inc({
    tone: modifyType,
    outcome: modifiedCheckInQuestion === null ? 'failure' : 'success'
  })

  // RESOLUTION
  const data = {modifiedCheckInQuestion}
  publish(SubscriptionChannel.MEETING, meetingId, 'ModifyCheckInQuestionSuccess', data, subOptions)
  return data
}

export default modifyCheckInQuestion
