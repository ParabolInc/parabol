import isValid from '../../isValid'
import {SetIsFreeMeetingTemplateSuccessResolvers} from '../../private/resolverTypes'

export type SetIsFreeMeetingTemplateSuccessSource = {
  updatedTemplateIds: string[]
}

const SetIsFreeMeetingTemplateSuccess: SetIsFreeMeetingTemplateSuccessResolvers = {
  updatedTemplates: async ({updatedTemplateIds}, _args, {dataLoader}) => {
    const updatedTemplates = (
      await dataLoader.get('meetingTemplates').loadMany(updatedTemplateIds)
    ).filter(isValid)
    return updatedTemplates
  }
}

export default SetIsFreeMeetingTemplateSuccess
