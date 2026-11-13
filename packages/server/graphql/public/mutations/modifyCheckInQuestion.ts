import {GraphQLError} from 'graphql'

import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import type {MutationResolvers} from '../resolverTypes'

const modifyCheckInQuestion: MutationResolvers['modifyCheckInQuestion'] = async (
  _source,
  {meetingId, checkInQuestion, modifyType},
  {dataLoader}
) => {
  // AUTH
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
  const {endedAt} = meeting

  if (endedAt) {
    throw new GraphQLError('Meeting has already ended', {extensions: {code: 'CONFLICT'}})
  }

  const openai = new OpenAIServerManager()
  const modifiedCheckInQuestion = await openai.modifyCheckInQuestion(checkInQuestion, modifyType)

  // RESOLUTION
  return {modifiedCheckInQuestion}
}

export default modifyCheckInQuestion
