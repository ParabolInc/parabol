import type {MoveTemplatePromptSuccessResolvers} from '../resolverTypes'

export type MoveTemplatePromptSuccessSource = {
  promptId: string
}

const MoveTemplatePromptSuccess: MoveTemplatePromptSuccessResolvers = {
  prompt: ({promptId}, _args, {dataLoader}) => {
    return dataLoader.get('templatePrompts').loadNonNull(promptId)
  }
}

export default MoveTemplatePromptSuccess
