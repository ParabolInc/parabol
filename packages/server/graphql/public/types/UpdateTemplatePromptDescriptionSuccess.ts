import type {UpdateTemplatePromptDescriptionSuccessResolvers} from '../resolverTypes'

export type UpdateTemplatePromptDescriptionSuccessSource = {
  promptId: string
}

const UpdateTemplatePromptDescriptionSuccess: UpdateTemplatePromptDescriptionSuccessResolvers = {
  prompt: ({promptId}, _args, {dataLoader}) => {
    return dataLoader.get('reflectPrompts').loadNonNull(promptId)
  }
}

export default UpdateTemplatePromptDescriptionSuccess
