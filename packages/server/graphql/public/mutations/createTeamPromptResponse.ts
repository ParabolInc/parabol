import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {upsertTeamPromptResponse} from '../../../postgres/queries/upsertTeamPromptResponses'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const createTeamPromptResponse: MutationResolvers['createTeamPromptResponse'] = async (
  _source,
  {meetingId, userId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  if (userId !== viewerId) {
    return standardError(new Error("Can't create response for others"), {userId: viewerId})
  }
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  const {endedAt, teamId} = meeting
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }
  if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})

  // VALIDATION
  /**
   * TODO: check if there's already a response for this user in this meeting
   */

  // RESOLUTION
  const emptyResponse = {
    meetingId,
    userId,
    sortOrder: 0,
    content: {},
    plaintextContent: ''
  }
  const teamPromptResponseId = await upsertTeamPromptResponse(emptyResponse)

  const data = {meetingId, teamPromptResponseId}
  publish(
    SubscriptionChannel.MEETING,
    meetingId,
    'CreateTeamPromptResponseSuccess',
    data,
    subOptions
  )

  return data
}

export default createTeamPromptResponse
