import type {UpdateTemplatePromptGroupColorSuccessResolvers} from '../resolverTypes'

export type UpdateTemplatePromptGroupColorSuccessSource = {
  promptId: string
}

const UpdateTemplatePromptGroupColorSuccess: UpdateTemplatePromptGroupColorSuccessResolvers = {
  prompt: ({promptId}, _args, {dataLoader}) => {
    return dataLoader.get('templatePrompts').loadNonNull(promptId)
  }
}

export default UpdateTemplatePromptGroupColorSuccess
