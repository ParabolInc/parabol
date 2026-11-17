import type {RemovePromptTemplatePayloadResolvers} from '../resolverTypes'

export type RemovePromptTemplatePayloadSource = {
  templateId: string
  settingsId: string
}

const RemovePromptTemplatePayload: RemovePromptTemplatePayloadResolvers = {
  template: ({templateId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingTemplates').loadNonNull(templateId)
  },
  meetingSettings: ({settingsId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingSettings').loadNonNull(settingsId)
  }
}

export default RemovePromptTemplatePayload
