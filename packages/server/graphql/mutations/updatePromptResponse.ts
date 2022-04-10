import {JSONContent} from '@tiptap/core'
import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getTeamPromptResponseById} from '../../postgres/queries/getTeamPromptResponsesByIds'
import {updateTeamPromptResponseContentById} from '../../postgres/queries/updateTeamPromptResponseContentById'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import UpdatePromptResponsePayload from '../types/UpdatePromptResponsePayload'
import extractTextFromTipTapJSONContent from './helpers/tiptap/extractTextFromTipTapJSONContent'

const updatePromptResponse = {
  type: GraphQLNonNull(UpdatePromptResponsePayload),
  description: `Update the content of a prompt response`,
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
    {promptResponseId, content}: {promptResponseId: number; content: string},
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
      return standardError(new Error("Can't edit other's response"), {userId: viewerId})
    }
    const {meetingId} = promptResponse

    // VALIDATION
    const contentJSON: JSONContent = JSON.parse(content)
    const plaintextContent = extractTextFromTipTapJSONContent(contentJSON)

    // RESOLUTION
    await updateTeamPromptResponseContentById({
      content,
      plaintextContent,
      id: promptResponseId
    })
    promptResponse.content = contentJSON
    promptResponse.plaintextContent = plaintextContent

    const data = {meetingId, promptResponseId}
    publish(SubscriptionChannel.MEETING, meetingId, 'UpdatePromptResponseSuccess', data, subOptions)

    return data
  }
}

export default updatePromptResponse
