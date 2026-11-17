import {getUserId} from '../../../utils/authorization'
import type {AddPokerTemplatePayloadResolvers} from '../resolverTypes'

export type AddPokerTemplatePayloadSource = {
  templateId: string
}

const AddPokerTemplatePayload: AddPokerTemplatePayloadResolvers = {
  pokerTemplate: async ({templateId}, _args, {dataLoader}) => {
    return await dataLoader.get('meetingTemplates').loadNonNull(templateId)
  },
  user: async (_src, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    return dataLoader.get('users').loadNonNull(viewerId)
  }
}

export default AddPokerTemplatePayload
