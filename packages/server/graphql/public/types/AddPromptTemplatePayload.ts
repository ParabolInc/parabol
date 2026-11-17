import {getUserId} from '../../../utils/authorization'
import type {AddPromptTemplatePayloadResolvers} from '../resolverTypes'

export type AddPromptTemplatePayloadSource = {
  templateId: string
}

const AddPromptTemplatePayload: AddPromptTemplatePayloadResolvers = {
  template: async ({templateId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingTemplates').loadNonNull(templateId)
  },
  user: async (_src, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    return dataLoader.get('users').loadNonNull(viewerId)
  }
}

export default AddPromptTemplatePayload
