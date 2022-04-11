import {JSONContent} from '@tiptap/core'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {updateTeamPromptResponseContentById} from '../../../postgres/queries/updateTeamPromptResponseContentById'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import extractTextFromTipTapJSONContent from '../../mutations/helpers/tiptap/extractTextFromTipTapJSONContent'
import {MutationResolvers} from '../resolverTypes'

const updateTeamPromptResponse: MutationResolvers['updateTeamPromptResponse'] = async (
  _source,
  {updatedTeamPromptResponse},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const {teamPromptResponseId, content} = updatedTeamPromptResponse

  // AUTH
  const promptResponse = await dataLoader
    .get('teamPromptResponses')
    .loadNonNull(teamPromptResponseId)
  if (!promptResponse) {
    return standardError(new Error('PromptResponse not found'), {userId: viewerId})
  }
  const {userId} = promptResponse
  if (userId !== viewerId) {
    return standardError(new Error("Can't edit other's response"), {userId: viewerId})
  }
  const {meetingId} = promptResponse
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  const {endedAt, teamId} = meeting
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }
  if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})

  // VALIDATION
  const contentJSON: JSONContent = JSON.parse(content)
  const plaintextContent = extractTextFromTipTapJSONContent(contentJSON)

  // RESOLUTION
  await updateTeamPromptResponseContentById({
    content,
    plaintextContent,
    id: teamPromptResponseId
  })
  promptResponse.content = contentJSON
  promptResponse.plaintextContent = plaintextContent

  const data = {meetingId, teamPromptResponseId}
  publish(SubscriptionChannel.MEETING, meetingId, 'UpdatePromptResponseSuccess', data, subOptions)

  return data
}

export default updateTeamPromptResponse
