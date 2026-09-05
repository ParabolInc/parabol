import {getUserId} from '../../../utils/authorization'
import type {AddTeamPromptTemplateSuccessResolvers} from '../resolverTypes'

export type AddTeamPromptTemplateSuccessSource = {
  templateId: string
}

const AddTeamPromptTemplateSuccess: AddTeamPromptTemplateSuccessResolvers = {
  teamPromptTemplate: async ({templateId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingTemplates').loadNonNull(templateId)
  },
  user: async (_src, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    return dataLoader.get('users').loadNonNull(viewerId)
  }
}

export default AddTeamPromptTemplateSuccess
