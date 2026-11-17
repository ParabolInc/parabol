import type {RenameTemplatePromptSuccessResolvers} from '../resolverTypes'

export type RenameTemplatePromptSuccessSource = {
  promptId: string
}

const RenameTemplatePromptSuccess: RenameTemplatePromptSuccessResolvers = {
  prompt: ({promptId}, _args, {dataLoader}) => {
    return dataLoader.get('templatePrompts').loadNonNull(promptId)
  }
}

export default RenameTemplatePromptSuccess
