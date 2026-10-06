import {getUserId} from '../../../utils/authorization'
import type {AddPromptTemplateSuccessResolvers} from '../resolverTypes'

export type AddPromptTemplateSuccessSource = {
  templateId: string
}

const AddPromptTemplateSuccess: AddPromptTemplateSuccessResolvers = {
  template: async ({templateId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingTemplates').loadNonNull(templateId)
  },
  user: async (_src, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    return dataLoader.get('users').loadNonNull(viewerId)
  }
}

export default AddPromptTemplateSuccess
