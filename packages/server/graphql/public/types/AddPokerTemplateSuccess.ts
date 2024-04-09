import {getUserId} from '../../../utils/authorization'
import {AddPokerTemplateSuccessResolvers, PokerTemplate} from '../resolverTypes'

export type AddPokerTemplateSuccessSource = {
  templateId: string
}

const AddPokerTemplateSuccess: AddPokerTemplateSuccessResolvers = {
  pokerTemplate: async ({templateId}, _args, {dataLoader}) => {
    return (await dataLoader.get('meetingTemplates').load(templateId)) as PokerTemplate
  },
  user: async (_src, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    return dataLoader.get('users').loadNonNull(viewerId)
  }
}

export default AddPokerTemplateSuccess
