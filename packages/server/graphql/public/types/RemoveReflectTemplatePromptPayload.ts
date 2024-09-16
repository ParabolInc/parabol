import {RemoveReflectTemplatePromptPayloadResolvers} from '../resolverTypes'

export type RemoveReflectTemplatePromptPayloadSource =
  | {
      promptId: string
      templateId: string
    }
  | {error: {message: string}}

const RemoveReflectTemplatePromptPayload: RemoveReflectTemplatePromptPayloadResolvers = {
  reflectTemplate: (source, _args, {dataLoader}) => {
    return 'templateId' in source
      ? dataLoader.get('meetingTemplates').loadNonNull(source.templateId)
      : null
  },

  prompt: (source, _args, {dataLoader}) => {
    return 'promptId' in source
      ? dataLoader.get('reflectPrompts').loadNonNull(source.promptId)
      : null
  }
}

export default RemoveReflectTemplatePromptPayload
