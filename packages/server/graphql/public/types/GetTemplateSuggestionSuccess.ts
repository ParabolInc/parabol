import {GetTemplateSuggestionSuccessResolvers} from '../resolverTypes'

export type GetTemplateSuggestionSuccessSource = {
  suggestedTemplateId: string
  explanation: string
}

const GetTemplateSuggestionSuccess: GetTemplateSuggestionSuccessResolvers = {
  suggestedTemplate: async ({suggestedTemplateId}, _args, {dataLoader}) => {
    const template = await dataLoader.get('meetingTemplates').loadNonNull(suggestedTemplateId)
    return template
  },
  explanation: ({explanation}) => explanation
}

export default GetTemplateSuggestionSuccess
