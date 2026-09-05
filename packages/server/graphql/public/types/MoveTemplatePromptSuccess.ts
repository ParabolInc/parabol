import type {MoveTemplatePromptSuccessResolvers} from '../resolverTypes'

export type MoveTemplatePromptSuccessSource = {
  promptId: string
}

const MoveTemplatePromptSuccess: MoveTemplatePromptSuccessResolvers = {
  prompt: ({promptId}, _args, {dataLoader}) => {
    return dataLoader.get('reflectPrompts').loadNonNull(promptId)
  }
}

export default MoveTemplatePromptSuccess
