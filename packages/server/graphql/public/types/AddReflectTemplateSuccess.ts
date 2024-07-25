import {getUserId} from '../../../utils/authorization'
import {AddReflectTemplateSuccessResolvers, ReflectTemplate} from '../resolverTypes'

export type AddPokerTemplateSuccessSource = {
  templateId: string
}

const AddPokerTemplateSuccess: AddReflectTemplateSuccessResolvers = {
  reflectTemplate: async ({templateId}, _args, {dataLoader}) => {
    return (await dataLoader.get('meetingTemplates').load(templateId)) as ReflectTemplate
  },
  user: async (_src, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    return dataLoader.get('users').loadNonNull(viewerId)
  }
}

export default AddPokerTemplateSuccess
