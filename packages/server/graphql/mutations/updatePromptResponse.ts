import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import UpdatePromptResponsePayload from '../types/UpdatePromptResponsePayload'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {GQLContext} from '../graphql'
import {updateTeamPromptResponseContentById} from '../../postgres/queries/updateTeamPromptResponseContentById'
import {getTeamPromptResponseById} from '../../postgres/queries/getTeamPromptResponsesByIds'
import standardError from '../../utils/standardError'
import {JSONContent} from '@tiptap/core'

const extractTextFromTipTapJSONContent = (input: JSONContent) => {
  if (input.text) {
    return input.text
  } else if (input.content) {
    const content = input.content
    const newLine = input.type === 'paragraph' ? '\n' : ''
    return content.map((subContent) => extractTextFromTipTapJSONContent(subContent)).join('') + newLine
  } else {
    return input.type === 'paragraph' ? '\n' : ''
  }
}

const updatePromptResponse = {
  type: GraphQLNonNull(UpdatePromptResponsePayload),
  description: ``,
  args: {
    promptResponseId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'A stringified TipTap content containing prompt response'
    }
  },
  resolve: async (
    _source: unknown,
    {promptResponseId, content},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const promptResponse = await getTeamPromptResponseById(promptResponseId)
    if (!promptResponse) {
      return standardError(new Error('PromptResponse not found'), {userId: viewerId})
    }
    const {userId} = promptResponse
    if (userId !== viewerId) {
      return standardError(new Error('Can\'t edit other\'s response'), {userId: viewerId})
    }
    const {meetingId} = promptResponse

    // VALIDATION
    const contentJSON: JSONContent = JSON.parse(content)
    const plaintextContent = extractTextFromTipTapJSONContent(contentJSON)

    // RESOLUTION
    updateTeamPromptResponseContentById({
      content,
      plaintextContent,
      id: promptResponseId
    })
    promptResponse.content = content
    promptResponse.plaintextContent = plaintextContent

    const data = {meetingId, promptResponseId}
    publish(SubscriptionChannel.MEETING, meetingId, 'UpdatePromptResponseSuccess', data, subOptions)

    return data
  }
}

export default updatePromptResponse
