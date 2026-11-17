import type {UpdateTemplatePromptDescriptionPayloadResolvers} from '../resolverTypes'

export type UpdateTemplatePromptDescriptionPayloadSource = {
  promptId: string
}

const UpdateTemplatePromptDescriptionPayload: UpdateTemplatePromptDescriptionPayloadResolvers = {
  prompt: ({promptId}, _args, {dataLoader}) => {
    return dataLoader.get('templatePrompts').loadNonNull(promptId)
  }
}

export default UpdateTemplatePromptDescriptionPayload
