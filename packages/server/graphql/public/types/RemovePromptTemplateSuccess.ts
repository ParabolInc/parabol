import type {RemovePromptTemplateSuccessResolvers} from '../resolverTypes'

export type RemovePromptTemplateSuccessSource = {
  templateId: string
  settingsId: string
}

const RemovePromptTemplateSuccess: RemovePromptTemplateSuccessResolvers = {
  template: ({templateId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingTemplates').loadNonNull(templateId)
  },
  meetingSettings: ({settingsId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingSettings').loadNonNull(settingsId)
  }
}

export default RemovePromptTemplateSuccess
