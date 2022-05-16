import {generateText, JSONContent} from '@tiptap/core'
import {createEditorExtensions} from 'parabol-client/components/promptResponse/PromptResponseEditor'
import TeamPromptResponseId from 'parabol-client/shared/gqlIds/TeamPromptResponseId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {TeamPromptResponse} from '../../../postgres/queries/getTeamPromptResponsesByIds'
import {upsertTeamPromptResponse as upsertTeamPromptResponseQuery} from '../../../postgres/queries/upsertTeamPromptResponses'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const upsertTeamPromptResponse: MutationResolvers['upsertTeamPromptResponse'] = async (
  _source,
  {teamPromptResponseId: inputTeamPromptResponseId, meetingId, content},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // VALIDATION
  if (inputTeamPromptResponseId) {
    const teamPromptResponse: TeamPromptResponse = await dataLoader
      .get('teamPromptResponses')
      .load(inputTeamPromptResponseId)
    if (!teamPromptResponse) {
      return standardError(new Error('TeamPromptResponse not found'), {userId: viewerId})
    }
    const {userId, meetingId: responseMeetingId} = teamPromptResponse
    if (userId !== viewerId) {
      return standardError(new Error("Can't edit other's response"), {userId: viewerId})
    }
    if (responseMeetingId !== meetingId) {
      return standardError(new Error("Can't edit response in another meeting"), {userId: viewerId})
    }
  }
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) {
    return standardError(new Error('Meeting not found'), {userId: viewerId})
  }
  const {endedAt, teamId} = meeting
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }
  if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})

  // RESOLUTION
  let contentJSON: JSONContent
  try {
    contentJSON = JSON.parse(content)
  } catch (e) {
    return standardError(new Error('Invalid stringified JSON'), {userId: viewerId})
  }

  let plaintextContent: string
  try {
    plaintextContent = generateText(contentJSON, createEditorExtensions())
  } catch (e) {
    return standardError(new Error('Invalid editor format'), {userId: viewerId})
  }

  const teamPromptResponseId = TeamPromptResponseId.join(
    await upsertTeamPromptResponseQuery({
      meetingId,
      userId: viewerId,
      sortOrder: 0, //TODO: placeholder as currently it's defined as non-null. Might decide to remove the column entirely later.
      content,
      plaintextContent
    })
  )
  const updatedTeamPromptResponse = await dataLoader
    .get('teamPromptResponses')
    .load(teamPromptResponseId)
  updatedTeamPromptResponse.content = contentJSON
  updatedTeamPromptResponse.plaintextContent = plaintextContent

  const data = {
    meetingId,
    teamPromptResponseId
  }
  publish(
    SubscriptionChannel.MEETING,
    meetingId,
    'UpsertTeamPromptResponseSuccess',
    data,
    subOptions
  )

  return data
}

export default upsertTeamPromptResponse
