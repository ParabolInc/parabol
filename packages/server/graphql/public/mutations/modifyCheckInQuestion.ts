import {getUserId} from '../../../utils/authorization'

import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const modifyCheckInQuestion: MutationResolvers['modifyCheckInQuestion'] = async (
  _source,
  {meetingId, checkInQuestion, modifyType},
  {authToken, dataLoader}
) => {
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

  // RESOLUTION
  return {modifiedCheckInQuestion}
}

export default modifyCheckInQuestion
