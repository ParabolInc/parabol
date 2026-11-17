import isValid from '../../isValid'
import type {SetIsFreeMeetingTemplatePayloadResolvers} from '../../private/resolverTypes'

export type SetIsFreeMeetingTemplatePayloadSource = {
  updatedTemplateIds: string[]
}

const SetIsFreeMeetingTemplatePayload: SetIsFreeMeetingTemplatePayloadResolvers = {
  updatedTemplates: async ({updatedTemplateIds}, _args, {dataLoader}) => {
    const updatedTemplates = (
      await dataLoader.get('meetingTemplates').loadMany(updatedTemplateIds)
    ).filter(isValid)
    return updatedTemplates
  }
}

export default SetIsFreeMeetingTemplatePayload
