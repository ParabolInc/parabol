import {getUserId} from '../../../utils/authorization'
import type {AddTeamHealthTemplatePayloadResolvers} from '../resolverTypes'

export type AddTeamHealthTemplatePayloadSource = {
  templateId: string
}

const AddTeamHealthTemplatePayload: AddTeamHealthTemplatePayloadResolvers = {
  teamHealthTemplate: async ({templateId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingTemplates').loadNonNull(templateId)
  },
  user: async (_src, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    return dataLoader.get('users').loadNonNull(viewerId)
  }
}

export default AddTeamHealthTemplatePayload
