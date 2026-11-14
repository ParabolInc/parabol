import {getUserId} from '../../../utils/authorization'
import type {AddTeamHealthTemplateSuccessResolvers} from '../resolverTypes'

export type AddTeamHealthTemplateSuccessSource = {
  templateId: string
}

const AddTeamHealthTemplateSuccess: AddTeamHealthTemplateSuccessResolvers = {
  teamHealthTemplate: async ({templateId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingTemplates').loadNonNull(templateId)
  },
  user: async (_src, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    return dataLoader.get('users').loadNonNull(viewerId)
  }
}

export default AddTeamHealthTemplateSuccess
