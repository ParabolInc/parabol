import type {UpdateTemplatePromptGroupColorSuccessResolvers} from '../resolverTypes'

export type UpdateTemplatePromptGroupColorSuccessSource = {
  promptId: string
}

const UpdateTemplatePromptGroupColorSuccess: UpdateTemplatePromptGroupColorSuccessResolvers = {
  prompt: ({promptId}, _args, {dataLoader}) => {
    return dataLoader.get('reflectPrompts').loadNonNull(promptId)
  }
}

export default UpdateTemplatePromptGroupColorSuccess
