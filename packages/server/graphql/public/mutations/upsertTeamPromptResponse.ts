import {JSONContent} from '@tiptap/core'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {TeamPromptResponse} from '../../../postgres/queries/getTeamPromptResponsesByIds'
import {
  InputTeamPromptResponse,
  upsertTeamPromptResponse as upsertTeamPromptResponseQuery
} from '../../../postgres/queries/upsertTeamPromptResponses'
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
  const {teamPromptResponseId: inputTeamPromptResponseId, meetingId, content} = teamPromptResponse

  // AUTH
  if (inputTeamPromptResponseId) {
    const teamPromptResponse: TeamPromptResponse = await dataLoader
      .get('teamPromptResponses')
      .load(inputTeamPromptResponseId)
    if (!teamPromptResponse) {
      return standardError(new Error('TeamPromptResponse not found'), {userId: viewerId})
    }
    const {userId} = teamPromptResponse
    if (userId !== viewerId) {
      return standardError(new Error("Can't edit other's response"), {userId: viewerId})
    }
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
  const teamPromptResponseInput: InputTeamPromptResponse = {
    meetingId,
    userId: viewerId,
    sortOrder: 0, //TODO: set correct sort order, need to fetch all responses for meeting
    content,
    plaintextContent
  }
  const teamPromptResponseId = await upsertTeamPromptResponseQuery(teamPromptResponseInput)

  const data = {
    meetingId,
    teamPromptResponseId
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
