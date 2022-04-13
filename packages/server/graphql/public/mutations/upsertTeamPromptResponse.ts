import {JSONContent} from '@tiptap/core'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {upsertTeamPromptResponse as upsertTeamPromptResponseQuery} from '../../../postgres/queries/upsertTeamPromptResponses'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import extractTextFromTipTapJSONContent from '../../mutations/helpers/tiptap/extractTextFromTipTapJSONContent'
import {MutationResolvers} from '../resolverTypes'

const upsertTeamPromptResponse: MutationResolvers['upsertTeamPromptResponse'] = async (
  _source,
  {teamPromptResponse},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const {teamPromptResponseId, meetingId, content} = teamPromptResponse

  // AUTH
  const promptResponse = teamPromptResponseId
    ? await dataLoader.get('teamPromptResponses').loadNonNull(teamPromptResponseId)
    : {
        meetingId,
        userId: viewerId,
        sortOrder: 0,
        content: {},
        plaintextContent: ''
      }
  if (!promptResponse) {
    return standardError(new Error('PromptResponse not found'), {userId: viewerId})
  }
  const {userId} = promptResponse
  if (userId !== viewerId) {
    return standardError(new Error("Can't edit other's response"), {userId: viewerId})
  }
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) {
    return standardError(new Error('Meeting not found'), {userId: viewerId})
  }
  const {endedAt, teamId, meetingType} = meeting
  if (meetingType !== 'teamPrompt') {
    return standardError(new Error('Cannot insert/update response to non-teamPrompt meeting'), {
      userId: viewerId
    })
  }
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }
  if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})

  // RESOLUTION
  const contentJSON: JSONContent = JSON.parse(content)
  const plaintextContent = extractTextFromTipTapJSONContent(contentJSON)

  const maybeNewTeamPromptResponseId = await upsertTeamPromptResponseQuery({
    meetingId,
    userId,
    sortOrder: promptResponse.sortOrder,
    content,
    plaintextContent
  })
  promptResponse.content = contentJSON
  promptResponse.plaintextContent = plaintextContent

  const data = {
    meetingId,
    teamPromptResponseId: teamPromptResponseId || maybeNewTeamPromptResponseId
  }
  publish(
    SubscriptionChannel.MEETING,
    meetingId,
    'UpdateTeamPromptResponseSuccess',
    data,
    subOptions
  )

  return data
}

export default upsertTeamPromptResponse
