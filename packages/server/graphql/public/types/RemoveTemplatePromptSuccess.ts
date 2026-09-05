import type {RemoveTemplatePromptSuccessResolvers} from '../resolverTypes'

export type RemoveTemplatePromptSuccessSource = {
  promptId: string
}

const RemoveTemplatePromptSuccess: RemoveTemplatePromptSuccessResolvers = {
  prompt: ({promptId}, _args, {dataLoader}) => {
    return dataLoader.get('reflectPrompts').loadNonNull(promptId)
  }
}

export default RemoveTemplatePromptSuccess
