import {getUserId} from '../../../utils/authorization'
import type {AddReflectTemplateSuccessResolvers} from '../resolverTypes'

export type AddReflectTemplateSuccessSource = {
  templateId: string
}

const AddReflectTemplateSuccess: AddReflectTemplateSuccessResolvers = {
  reflectTemplate: async ({templateId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingTemplates').loadNonNull(templateId)
  },
  user: async (_src, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    return dataLoader.get('users').loadNonNull(viewerId)
  }
}

export default AddReflectTemplateSuccess
